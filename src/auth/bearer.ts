import Hapi from "@hapi/hapi";

import { PrismaClient } from "@prisma/client";
import { throwLoginError } from "~/helpers/errors";
import { createHash } from "~/helpers/crypto";

const prisma = new PrismaClient();

export const checkBeareAccessToken = async (
  request: Hapi.Request,
  token: string,
  h: Hapi.ResponseToolkit
) => {
  const id = request.query.id as string | undefined;

  if (!id) {
    throwLoginError();
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throwLoginError();
    return;
  }

  const isSame = user.accessToken === createHash(token);

  if (!isSame) {
    throwLoginError();
    return;
  }

  return { isValid: true, artifacts: user };
};
