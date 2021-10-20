import Hapi from "@hapi/hapi";
import { PrismaClient, RecommendationClient } from "@prisma/client";
import admin from "firebase-admin";
import { throwInvalidError, throwLoginError } from "~/helpers/errors";
import ngeohash from "ngeohash";

import {
  CreateRecommendationClientHeaders,
  UpdateRecommendationClientPaylaod,
  VerifyEmailPayload,
} from "~/routes/recommendationClients/validator";
import { RecommendationClientArtifacts } from "~/auth/bearer";
import { createS3ObjectPath } from "~/helpers/aws";
import { createHash } from "~/helpers/crypto";
import { create4digitNumber } from "~/utils";
import { sendMail } from "~/mailer";
import { verifyAuthCode } from "~/helpers/clientAuthCode/verifyAuthCode";

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
  const headers = req.headers as CreateRecommendationClientHeaders;
  const token = headers.authorization.split(" ")[1]; // Bearer取り出し
  const rClientAdmin = admin.app("recommendationClient");

  let uid: string;
  let email: string;

  try {
    const decodedToken = await rClientAdmin.auth().verifyIdToken(token);

    if (!decodedToken.email) {
      return throwLoginError();
    }

    uid = decodedToken.uid;
    email = decodedToken.email;
  } catch (e) {
    return throwLoginError();
  }

  const result = await prisma.recommendationClient.create({
    data: {
      uid,
    },
  });

  const code = create4digitNumber();

  await prisma.clientAuthCode.create({
    data: {
      clientId: result.id,
      code,
    },
  });

  sendMail({ address: email, text: `認証コードは ${code} です。` });

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

const verifyEmail = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const client = req.auth.artifacts as RecommendationClientArtifacts;
  const payload = req.payload as VerifyEmailPayload;

  try {
    await verifyAuthCode({
      clientId: client.id,
      code: payload.code,
    });

    await prisma.recommendationClient.update({
      where: {
        id: client.id,
      },
      data: {
        verifiedEmail: true,
      },
    });
  } catch (e) {
    return e;
  }

  return h.response().code(200);
};

export const handlers = {
  create,
  get,
  update,
  changeShowedPostModal,
  deleteClient,
  verifyEmail,
};
