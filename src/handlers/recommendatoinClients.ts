import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import admin from "firebase-admin";
import { throwInvalidError, throwLoginError } from "~/helpers/errors";

import {
  CreateRecommendationClientHeaders,
  CreateRecommendationClientPayload,
  UpdateRecommendationClientPaylaod,
} from "~/routes/recommendationClients/validator";
import { RecomendationClientArtifacts } from "~/auth/bearer";
import { createClientRecommendationClient } from "~/helpers/recommendationClients";
import { createS3ObjectPath } from "~/helpers/aws";

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

  const result = await prisma.recommendationClient.create({
    data: {
      name: payload.name,
      uid,
    },
  });

  return {
    id: result.id,
    name: result.name,
  };
};

const get = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const client = req.auth.artifacts as RecomendationClientArtifacts;

  return createClientRecommendationClient(client);
};

const update = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const client = req.auth.artifacts as RecomendationClientArtifacts;
  const {
    name,
    image,
    address,
    url,
    instagram,
    twitter,
    ext,
  } = req.payload as UpdateRecommendationClientPaylaod;

  let imagePath: string | undefined;

  if (image && ext) {
    const result = await createS3ObjectPath({
      data: image,
      domain: "rClientProfileImage",
      id: client.id,
      ext,
    });

    if (!result) return throwInvalidError("画像を作成できませんでした");

    imagePath = result.source;
  }

  await prisma.recommendationClient.update({
    where: {
      id: client.id,
    },
    data: {
      name,
      address,
      url,
      instagram,
      twitter,
      image: imagePath,
    },
  });

  return h.response().code(200);
};

export const recommendationClientHandler = {
  create,
  get,
  update,
};
