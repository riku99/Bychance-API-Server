import Hapi from "@hapi/hapi";
import admin from "firebase-admin";

import { prisma } from "~/lib/prisma";
import { RecommendationClientArtifacts } from "~/auth/bearer";
import { create4digitNumber } from "~/utils";
import { sendMail } from "~/mailer";
import { throwInvalidError, throwLoginError } from "~/helpers/errors";

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

export const handlers = {
  createClientAuthCodeForPasswordReset,
};
