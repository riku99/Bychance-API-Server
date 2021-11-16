import Hapi from "@hapi/hapi";
import admin from "firebase-admin";

import { PrismaClient, User, RecommendationClient } from "@prisma/client";
import { prisma } from "~/lib/prisma";

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

export const checkUserToken = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit,
  token: string
) => {
  try {
    const { uid } = await admin.auth().verifyIdToken(token);
    const user = await prisma.user.findUnique({
      where: {
        uid,
      },
    });

    if (!user) {
      return invalidReturnData;
    }

    return { isValid: true, credentials: {}, artifacts: user };
  } catch (e) {
    return invalidReturnData;
  }
};

export type RecommendationClientArtifacts = RecommendationClient;

export const checkRecommendationClient = async (
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

export const checkConsoleAdmin = async (
  request: Hapi.Request,
  token: string,
  h: Hapi.ResponseToolkit
) => {
  const consoleAdmin = admin.app("console");
  try {
    await consoleAdmin.auth().verifyIdToken(token);

    return {
      isValid: true,
      credentials: {},
      artifacts: {},
    };
  } catch (e) {
    return invalidReturnData;
  }
};
