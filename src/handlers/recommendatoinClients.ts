import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import admin from "firebase-admin";

import {
  CreateRecommendationClientHeaders,
  CreateRecommendationClientPayload,
} from "~/routes/recommendationClients/validator";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const payload = req.payload as CreateRecommendationClientPayload;
  const headers = req.headers as CreateRecommendationClientHeaders;
  const token = headers.authorization.split(" ")[1]; // Bearer取り出し

  const { uid } = await admin.auth().verifyIdToken(token);

  await prisma.recommendationClient.create({
    data: {
      name: payload.name,
      uid,
    },
  });
};
