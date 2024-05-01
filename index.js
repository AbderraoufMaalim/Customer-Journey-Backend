const express = require("express");
const { GracefulShutdownServer } = require("medusa-core-utils");
const { Server } = require("socket.io");
const { NativeConnection, Worker } = require("@temporalio/worker");
const { Connection, Client } = require("@temporalio/client");
const activities = require("./dist/temporal/activities");
const { firstConnectionWorkflow } = require("./dist/temporal/workflows");
const { nanoid } = require("nanoid");

const loaders = require("@medusajs/medusa/dist/loaders/index").default;

;(async() => {
  async function start() {
    const app = express()
    const directory = process.cwd()

    try {
      const { container } = await loaders({
        directory,
        expressApp: app
      })
      const configModule = container.resolve("configModule")
      const port = process.env.PORT ?? configModule.projectConfig.port ?? 9000
  
      

      const server = GracefulShutdownServer.create(
        app.listen(port, async (err) => {
          if (err) {
            return
          }
          console.log(`Server is ready on port: ${port}`)
        })
      )

      const io = new Server(server, {
        cors: {
          origin: "*",
        },
      });

      activities.set_io(io);

      io.on("connection", async (socket) => {
        console.log("A user has connected")
        try {
        const clientConnection = await Connection.connect({ address: "127.0.0.1:7233" });

        const client = new Client({
          clientConnection,
          // namespace: 'foo.bar', // connects to 'default' namespace if not specified
        });

        const handle = await client.workflow.start(firstConnectionWorkflow, {
          taskQueue: "hello-world",
          // type inference works! args: [name: string]
          args: ["Temporals", socket.id],
          // in practice, use a meaningful business ID, like customerId or transactionId
          workflowId: "workflow-54321",
          //workflowId: "workflow-" + nanoid(),
        });
        console.log(`Started workflow ${handle.workflowId}`);

        // optional: wait for client result
        console.log(await handle.result()); // Hello, Temporal!
      } catch(e){
        console.log(e);
      } 
      }) 

      try {
      const connection = await NativeConnection.connect({
        address: "127.0.0.1:7233",
        // TLS and gRPC metadata configuration goes here.
      });
      // Step 2: Register Workflows and Activities with the Worker.
      const worker = await Worker.create({
        connection,
        namespace: "default",
        taskQueue: "hello-world",
        // Workflows are registered using a path as they run in a separate JS context.
        workflowsPath: require.resolve("./dist/temporal/workflows"),
        activities,
      });

      await worker.run();
      } catch(e){
        console.log(e);
      }

      
      // Handle graceful shutdown
      const gracefulShutDown = () => {
        server
          .shutdown()
          .then(() => {
            console.info("Gracefully stopping the server.")
            process.exit(0)
          })
          .catch((e) => {
            console.error("Error received when shutting down the server.", e)
            process.exit(1)
          })
      }
      process.on("SIGTERM", gracefulShutDown)
      process.on("SIGINT", gracefulShutDown)
    } catch (err) {
      console.error("Error starting server", err)
      process.exit(1)
    }
  }

  await start()
})()
