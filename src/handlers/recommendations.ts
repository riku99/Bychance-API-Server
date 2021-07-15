import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { CreateRecommendatoinPayload } from "~/routes/recommendations/validator";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {};

export const recommendationHandler = {
  create,
};
