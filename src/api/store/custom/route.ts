import { Client } from "@temporalio/client";
import { productRecommendationSignal } from "../../../Temporal/signal";

import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

export const GET = (req: MedusaRequest, res: MedusaResponse) => {
  res.json({
    message: "[GET] Hello world!",
  });
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const client = new Client();
  const handle = client.workflow.getHandle("workflow-54321");
  await handle.signal(productRecommendationSignal, {
    targetedProduct: (req.body as { targetedProduct: string }).targetedProduct,
    productType: (req.body as { productType: string }).productType,
  });
  res.json({
    message: "[POST] Hello world!",
  });
};
