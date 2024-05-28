import { dataSource } from "@medusajs/medusa/dist/loaders/database";
import { Customer } from "@medusajs/medusa";
import { Client } from "@temporalio/client";
import { nanoid } from "nanoid";
import { Socket } from "socket.io";
import { firstConnectionWorkflow } from "../Temporal/workflows";
import { socketChangedSignal } from "../Temporal/signal";

export async function checkWorkflowId(
  payload: string,
  client: Client,
  socket: Socket
) {
  if (!payload) {
    const workflowId = "workflow-" + nanoid();
    socket.emit("set-workflow-id", { workflowId });

    try {
      const handle = await client.workflow.start(firstConnectionWorkflow, {
        taskQueue: "hello-world",
        // type inference works! args: [name: string]
        args: ["Temporals", socket.id],
        // in practice, use a meaningful business ID, like customerId or transactionId
        workflowId: workflowId,
        //workflowId: "workflow-" + nanoid(),
      });
      console.log(`Started workflow ${handle.workflowId}`);
      return handle;
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      const handle = await client.workflow.getHandle(payload);
      handle.signal(socketChangedSignal, {
        changedSocketId: socket.id,
      });
      return handle;
    } catch (error) {
      console.log(error);
    }
  }
}

export async function getCustomerWorkflowId(
  email: string,
  client: Client,
  socket: Socket
) {
  try {
    const CustomerRepository = dataSource.getRepository(Customer);
    const customer = await CustomerRepository.findOne({
      where: {
        email: email,
      },
    });
    socket.emit("set-workflow-id", {
      workflowId: customer.workflowId,
    });

    const handle = await client.workflow.getHandle(customer.workflowId);
    return handle;
  } catch (error) {
    console.log(error);
  }
}

export async function getNewWorkflowId(socket: Socket, client: Client) {
  const workflowId = "workflow-" + nanoid();
  socket.emit("set-workflow-id", { workflowId });

  try {
    const handle = await client.workflow.start(firstConnectionWorkflow, {
      taskQueue: "hello-world",
      // type inference works! args: [name: string]
      args: ["Temporals", socket.id],
      // in practice, use a meaningful business ID, like customerId or transactionId
      workflowId: workflowId,
      //workflowId: "workflow-" + nanoid(),
    });
    console.log(`Started workflow ${handle.workflowId}`);
    return handle;
  } catch (error) {
    console.log(error);
  }
}
