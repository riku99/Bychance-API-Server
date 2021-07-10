import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import admin from "firebase-admin";
import { throwLoginError } from "~/helpers/errors";

import {
  CreateRecommendationClientHeaders,
  CreateRecommendationClientPayload,
} from "~/routes/recommendationClients/validator";
import { RecomendationClientArtifacts } from "~/auth/bearer";
import { createClientRecommendationClient } from "~/helpers/recommendationClients";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const payload = req.payload as CreateRecommendationClientPayload;
  const headers = req.headers as CreateRecommendationClientHeaders;
  const token = headers.authorization.split(" ")[1]; // Bearer取り出し
  const rClientAdmin = admin.app("recommendationClient");

  let uid: string;

  try {
    const decodedToken = await rClientAdmin.auth().verifyIdToken(token);
    uid = decodedToken.uid;
  } catch (e) {
    return throwLoginError();
  }

  await prisma.recommendationClient.create({
    data: {
      name: payload.name,
      uid,
    },
  });

  return {
    name: payload.name,
  };
};

const get = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const client = req.auth.artifacts as RecomendationClientArtifacts;

  return createClientRecommendationClient(client);
};

export const recommendationClientHandler = {
  create,
  get,
};
