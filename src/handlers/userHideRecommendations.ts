import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { CreateUserHideRecommendationParams } from "~/routes/userHideRecommendations/validator";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const params = req.params as CreateUserHideRecommendationParams;

  await prisma.userHideRecommendation.create({
    data: {
      recommendationId: Number(params.id),
      userId: user.id,
    },
  });

  return h.response().code(200);
};

export const handlers = {
  create,
};
