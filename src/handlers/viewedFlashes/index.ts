import Hapi from "@hapi/hapi";
import { PrismaClient, Prisma } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { CreateViewedFlashPayload } from "~/routes/viewedFlashes/validator";

const prisma = new PrismaClient();

const createViewedFlash = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateViewedFlashPayload;

  const existing = await prisma.viewedFlash.findUnique({
    where: {
      userId_flashId_unique: {
        userId: user.id,
        flashId: payload.flashId,
      },
    },
  });

  if (existing) {
    return h.response().code(200);
  }

  await prisma.viewedFlash.create({
    data: {
      flashId: payload.flashId,
      userId: user.id,
    },
  });

  return h.response().code(200);
};

export const viewedFlashHandler = {
  createViewedFlash,
};
