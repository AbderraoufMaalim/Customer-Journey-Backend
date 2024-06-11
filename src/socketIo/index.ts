import { dataSource } from "@medusajs/medusa/dist/loaders/database";
import { Customer } from "@medusajs/medusa";
import { Client } from "@temporalio/client";
import { nanoid } from "nanoid";
import { Socket } from "socket.io";
import { firstConnectionWorkflow } from "../Temporal/workflows";
import { socketChangedSignal, orderPlacedSignal } from "../Temporal/signal";

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
      console.log("hna3");

      console.log(error);
    }
  } else {
    let p;
    try {
      p = await client.workflowService.getWorkflowExecutionHistoryReverse({
        namespace: "default",
        execution: {
          workflowId: payload,
        },
      });
    } catch (error) {
      console.log("hna6");
      console.log(error);
    }
    if (p && p.history.events[0].workflowExecutionCompletedEventAttributes) {
      try {
        const handle = await client.workflow.getHandle(payload);
        handle.signal(socketChangedSignal, {
          changedSocketId: socket.id,
        });
        return handle;
      } catch (e) {
        console.log("hna2");

        console.log(e);
      }
    } else {
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
        console.log("hna1");
        console.log(error);
      }
    }
    //   } else
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

export async function orderPlaced(cartId, workflowId, client) {
  try {
    const handle = await client.workflow.getHandle(workflowId);
    handle.signal(orderPlacedSignal, {
      cartId,
    });
    return handle;
  } catch (e) {
    console.log(e);
  }
}
