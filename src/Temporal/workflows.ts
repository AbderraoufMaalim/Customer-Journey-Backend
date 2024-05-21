// @@@SNIPSTART typescript-hello-workflow
import { Workflow, proxyActivities, sleep } from "@temporalio/workflow";
import { setHandler } from '@temporalio/workflow';
import * as wf from '@temporalio/workflow';

// Only import the activity types
import * as activities from "./activities";
import { JoinInput, productRecommendationSignal } from "./signal";

const { inviteTosubscribe, recommendProducts } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
});

/** A workflow that simply calls an activity */
export async function firstConnectionWorkflow(name: string, socket: any): Promise<string> {
  await sleep("10 seconds");
  await inviteTosubscribe(name, socket);

  let emailSent = false;
  setHandler(productRecommendationSignal, async ({ targetedProduct, productType, email }: JoinInput) => {
    await recommendProducts({targetedProduct, productType, email});
    emailSent = true;
  });
  await wf.condition(() => emailSent === true, "2 minutes");
  return " ";
}
// @@@SNIPEND