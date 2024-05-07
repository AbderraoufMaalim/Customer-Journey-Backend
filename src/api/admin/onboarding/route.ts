import type { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { EntityManager } from "typeorm";

import OnboardingService from "../../../services/onboarding";
import CustomerService from "src/services/customer";
import EventBusService from "@medusajs/medusa";
import CustomerRepository from "@medusajs/medusa/dist/repositories/customer";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const onboardingService: OnboardingService =
    req.scope.resolve("onboardingService");

  const status = await onboardingService.retrieve();

  const customerService: CustomerService = req.scope.resolve("customerService");

  console.log(
    req.scope.resolve("customerService"),
    "=========================================",
    req.scope.resolve("onboardingService")
  );

  const ad = CustomerRepository;
  const b = await ad.findOne({
    where: {
      email: "d@gmail.com",
    },
  });

  // const abt = new CustomerService({CustomerRepository,EventBusService,})

  // const sth = await customerService.getMessage();

  console.log(b, "this is sth ================");

  res.status(200).json({ status });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const onboardingService: OnboardingService =
    req.scope.resolve("onboardingService");
  const manager: EntityManager = req.scope.resolve("manager");

  const status = await manager.transaction(async (transactionManager) => {
    return await onboardingService
      .withTransaction(transactionManager)
      .update(req.body);
  });

  res.status(200).json({ status });
}
