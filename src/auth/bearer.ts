import Hapi from "@hapi/hapi";
import admin from "firebase-admin";

import { PrismaClient, User, RecommendationClient } from "@prisma/client";
import { createHash } from "~/helpers/crypto";

const prisma = new PrismaClient();

export type Artifacts = User;

type ReturnType =
  | {
      isValid: false;
      credentials: {};
    }
  | {
      isValid: true;
      credentials: {};
      artifacts: Artifacts;
    };

const invalidReturnData = { isValid: false, credentials: {} };

// 認可が必要なAPIのAuthorizationヘッダ + クエリのidフィールドはこの認可プロセスで検証を行えるのでそのためのバリデーションは定義する必要ない
export const checkBeareAccessToken = async (
  request: Hapi.Request,
  token: string,
  h: Hapi.ResponseToolkit
): Promise<ReturnType> => {
  const id = request.query.id as string | undefined;

  if (!id) {
    // Boomを使ったエラーのスローはstrategy作成時のunauthorizeに実装する
    // throwLoginError();
    return { isValid: false, credentials: {} };
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return { isValid: false, credentials: {} };
  }

  const isSame = user.accessToken === createHash(token);

  if (!isSame) {
    return { isValid: false, credentials: {} };
  }

  // credentialsは例えisValidがfalseでも、trueだがhandler内で必要なくても定義しないとダメ
  return { isValid: true, credentials: {}, artifacts: user };
};

export type RecommendationClientArtifacts = RecommendationClient;

export const checkBeareFirebaseJWT = async (
  request: Hapi.Request,
  token: string,
  h: Hapi.ResponseToolkit
) => {
  const rClientAdmin = admin.app("recommendationClient");
  try {
    const { uid } = await rClientAdmin.auth().verifyIdToken(token);
    const client = await prisma.recommendationClient.findUnique({
      where: {
        uid,
      },
    });

    if (!client) {
      return invalidReturnData;
    }

    return { isValid: true, credentials: {}, artifacts: client };
  } catch (e) {
    return invalidReturnData;
  }
};
