import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { CreateRecommendatoinPayload } from "~/routes/recommendations/validator";
import { RecomendationClientArtifacts } from "~/auth/bearer";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const client = req.auth.artifacts as RecomendationClientArtifacts;
  const {
    title,
    text,
    images,
    coupon,
    endTime,
  } = req.payload as CreateRecommendatoinPayload;

  console.log(typeof images);

  return h.response().code(200);
};

export const recommendationHandler = {
  create,
};
