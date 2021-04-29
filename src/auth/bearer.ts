import Hapi from "@hapi/hapi";

import { PrismaClient } from "@prisma/client";
import { createHash } from "~/helpers/crypto";

const prisma = new PrismaClient();

export const checkBeareAccessToken = async (
  request: Hapi.Request,
  token: string,
  h: Hapi.ResponseToolkit
) => {
  const id = request.query.id as string | undefined;

  if (!id) {
    // Boomを使ったエラーのスローはstrategy作成時のunauthorizeに実装する
    // throwLoginError();
    return { isValid: false };
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return { isValid: false };
  }

  const isSame = user.accessToken === createHash(token);

  if (!isSame) {
    return { isValid: false };
  }

  return { isValid: true, artifacts: user };
};
