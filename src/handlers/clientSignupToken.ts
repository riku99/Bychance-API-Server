import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import { differenceInHours } from "date-fns";

import { GetClientSignupTokenParams } from "~/routes/clientSignupToken/validator";
import { throwInvalidError } from "~/helpers/errors";
import { RecommendationClientArtifacts } from "~/auth/bearer";
import { createRandomString } from "~/helpers/crypto";

const prisma = new PrismaClient();

const getClientSignupToken = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const params = req.params as GetClientSignupTokenParams;

  const token = await prisma.clientSignupToken.findUnique({
    where: {
      token: params.signupToken,
    },
  });

  if (!token) {
    return throwInvalidError("文字が間違っています");
  }

  await prisma.clientSignupToken.delete({
    where: {
      token: params.signupToken,
    },
  });

  const hoursDiff = differenceInHours(new Date(), token.createdAt);

  if (hoursDiff > 6) {
    return throwInvalidError("有効期限が切れています");
  }

  return h.response().code(200);
};

const create = async (req: Hapi.Request) => {
  const client = req.auth.artifacts as RecommendationClientArtifacts;

  if (!client.admin) {
    return throwInvalidError();
  }

  const str = createRandomString().slice(0, 8);

  await prisma.clientSignupToken.create({
    data: {
      token: str,
    },
  });

  return str;
};

export const clientSignupTokenHandler = {
  getClientSignupToken,
  create,
};
