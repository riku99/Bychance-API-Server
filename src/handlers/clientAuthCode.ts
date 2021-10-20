import Hapi from "@hapi/hapi";
import admin from "firebase-admin";

import { prisma } from "~/lib/prisma";
import { RecommendationClientArtifacts } from "~/auth/bearer";
import { create4digitNumber } from "~/utils";
import { sendMail } from "~/mailer";
import { throwInvalidError, throwLoginError } from "~/helpers/errors";
import { verifyAuthCode } from "~/helpers/clientAuthCode/verifyAuthCode";
import { VerifyAuthCodeForPasswordResetQuery } from "~/routes/clientAuthCode/validator";

const createClientAuthCodeForPasswordReset = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const client = req.auth.artifacts as RecommendationClientArtifacts;
  const clientAdmin = admin.app("recommendationClient");

  const adminUser = await clientAdmin.auth().getUser(client.uid);

  if (!adminUser) {
    return throwLoginError();
  }

  const existingData = await prisma.clientAuthCode.findUnique({
    where: {
      clientId: client.id,
    },
  });

  if (existingData) {
    await prisma.clientAuthCode.delete({
      where: {
        id: existingData.id,
      },
    });
  }

  const code = create4digitNumber();
  await prisma.clientAuthCode.create({
    data: {
      clientId: client.id,
      code,
    },
  });

  if (!adminUser.email) {
    return throwInvalidError();
  }

  await sendMail({
    address: adminUser.email,
    text: `パスワード変更のための認証コードは ${code} です。`,
  });

  return h.response().code(200);
};

const verifyClientAuthCodeForPasswordReset = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const client = req.auth.artifacts as RecommendationClientArtifacts;
  const query = req.query as VerifyAuthCodeForPasswordResetQuery;

  try {
    await verifyAuthCode({
      clientId: client.id,
      code: Number(query.code),
    });
  } catch (e) {
    return e;
  }

  return h.response().code(200);
};

export const handlers = {
  createClientAuthCodeForPasswordReset,
  verifyClientAuthCodeForPasswordReset,
};
