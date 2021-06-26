import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { CreateDeviceTokenPayload } from "~/routes/deviceToken/validator";

const prisma = new PrismaClient();

const createDeviceToken = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateDeviceTokenPayload;

  const existingToken = await prisma.deviceToken.findUnique({
    where: {
      token: payload.token,
    },
  });

  if (!existingToken) {
    await prisma.deviceToken.create({
      data: {
        userId: user.id,
        token: payload.token,
      },
    });
  }

  return h.response().code(200);
};

export const deviceTokenHandler = {
  createDeviceToken,
};
