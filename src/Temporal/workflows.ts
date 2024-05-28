// @@@SNIPSTART typescript-hello-workflow
import { Workflow, proxyActivities, sleep } from "@temporalio/workflow";
import { setHandler } from "@temporalio/workflow";
import * as wf from "@temporalio/workflow";

// Only import the activity types
import * as activities from "./activities";
import {
  JoinInput,
  productRecommendationSignal,
  SocketId,
  socketChangedSignal,
} from "./signal";

const { inviteTosubscribe, recommendProducts } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: "1 minute",
});

/** A workflow that simply calls an activity */
export async function firstConnectionWorkflow(
  name: string,
  socket: any
): Promise<string> {
  let STEP = "desire";
  let socketId = socket;
  await sleep("10 seconds");
  setHandler(socketChangedSignal, async ({ changedSocketId }: SocketId) => {
    socketId = changedSocketId;
  });

  await inviteTosubscribe(name, socketId);

  let emailSent = false;
  STEP = "intention";

  setHandler(
    productRecommendationSignal,
    async ({ targetedProduct, productType, email }: JoinInput) => {
      await recommendProducts({ targetedProduct, productType, email });
      emailSent = true;
      STEP = "trying";
    }
  );
  await wf.condition(() => emailSent === true, "2 minutes");

  if (emailSent) {
  }

  return " ";
}
// @@@SNIPEND
