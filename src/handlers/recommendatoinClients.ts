import Hapi from "@hapi/hapi";
import { PrismaClient, RecommendationClient } from "@prisma/client";
import admin from "firebase-admin";
import { throwInvalidError, throwLoginError } from "~/helpers/errors";
import ngeohash from "ngeohash";

import {
  CreateRecommendationClientHeaders,
  CreateRecommendationClientPayload,
  UpdateRecommendationClientPaylaod,
} from "~/routes/recommendationClients/validator";
import { RecommendationClientArtifacts } from "~/auth/bearer";
import { createS3ObjectPath } from "~/helpers/aws";
import { createHash } from "~/helpers/crypto";

const prisma = new PrismaClient();

const formRecommendationClient = (client: RecommendationClient) => {
  const {
    id,
    name,
    image,
    lat,
    lng,
    address,
    instagram,
    twitter,
    url,
    enablePushNotification,
    showedPostModal,
    admin,
  } = client;

  return {
    id,
    name,
    image,
    lat,
    lng,
    address,
    instagram,
    twitter,
    url,
    enablePushNotification,
    showedPostModal,
    admin,
  };
};

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
  const client = req.auth.artifacts as RecommendationClientArtifacts;

  return formRecommendationClient(client);
};

const update = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const client = req.auth.artifacts as RecommendationClientArtifacts;
  const {
    name,
    image,
    address,
    url,
    instagram,
    twitter,
    ext,
    lat,
    lng,
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

  let geohash: string | undefined;
  if (lat && lng) {
    const gh = ngeohash.encode(lat, lng, 7);
    geohash = createHash(gh); // Userではないので安全性的な面からはハッシュ化する必要ないが、Userのgeohashと照らし合わせて検索するときにUser側はハッシュ化されたものなのでこっちもそれに合わす
  }

  const result = await prisma.recommendationClient.update({
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
      lat,
      lng,
      geohash,
    },
  });

  return formRecommendationClient(result);
};

const changeShowedPostModal = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const client = req.auth.artifacts as RecommendationClientArtifacts;

  await prisma.recommendationClient.update({
    where: {
      id: client.id,
    },
    data: {
      showedPostModal: true,
    },
  });

  return h.response().code(200);
};

const deleteClient = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const client = req.auth.artifacts as RecommendationClientArtifacts;
  const rClientAdmin = admin.app("recommendationClient");

  await prisma.recommendationClient.update({
    where: {
      id: client.id,
    },
    data: {
      name: "",
      image: null,
      address: null,
      instagram: null,
      twitter: null,
      lat: null,
      lng: null,
      geohash: null,
      deleted: true,
      url: null,
    },
  });

  await prisma.recommendation.updateMany({
    where: {
      clientId: client.id,
    },
    data: {
      display: false,
    },
  });

  await rClientAdmin.auth().deleteUser(client.uid); // uidからユーザー見つけられなかったらエラー出す

  return h.response().code(200);
};

export const recommendationClientHandler = {
  create,
  get,
  update,
  changeShowedPostModal,
  deleteClient,
};
