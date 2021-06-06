import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { CreateFlashStampPayload } from "~/routes/flashStamps/validator";

const prisma = new PrismaClient();

const createFlashStamp = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateFlashStampPayload;

  await prisma.flashStamp.create({
    data: {
      userId: user.id,
      flashId: payload.flashId,
      value: payload.value,
    },
  });

  return h.response().code(200);
};

export const flashStampsHandler = {
  createFlashStamp,
};
