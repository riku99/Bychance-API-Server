import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { throwInvalidError } from "~/helpers/errors";
import { CreateFlashStampPayload } from "~/routes/flashStamps/validator";

const prisma = new PrismaClient();

const createFlashStamp = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateFlashStampPayload;

  try {
    await prisma.flashStamp.create({
      data: {
        userId: user.id,
        flashId: payload.flashId,
        value: payload.value,
      },
    });
  } catch {
    // return throwInvalidError();
  }

  return {
    userId: user.id,
    flashId: payload.flashId,
    value: payload.value,
  };
};

export const flashStampsHandler = {
  createFlashStamp,
};
