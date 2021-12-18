import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import { nowJST, prisma } from "~/lib/prisma";
import { Artifacts } from "~/auth/bearer";
import {
  CreateFlashPayload,
  DeleteFlashParams,
} from "~/routes/flashes/validator";
import { createS3ObjectPath } from "~/helpers/aws";
import { throwInvalidError } from "~/helpers/errors";

const createFlash = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateFlashPayload;

  const url = await createS3ObjectPath({
    data: payload.source,
    domain: "flash",
    id: user.id,
    ext: payload.ext,
    sourceType: payload.sourceType,
  });

  if (!url) {
    return throwInvalidError();
  }

  const flash = await prisma.flash.create({
    data: {
      source: url.source,
      sourceType: payload.sourceType,
      userId: user.id,
    },
  });

  return flash;
};

const deleteFlash = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const params = req.params as DeleteFlashParams;

  const f = await prisma.flash.findFirst({
    where: {
      id: Number(params.flashId),
      userId: user.id,
    },
  });

  if (!f) {
    return throwInvalidError();
  }

  const deleteStamps = prisma.flashStamp.deleteMany({
    where: {
      flashId: Number(params.flashId),
    },
  });

  const deleteViewed = prisma.viewedFlash.deleteMany({
    where: {
      flashId: Number(params.flashId),
    },
  });

  const deleteFlash = prisma.flash.delete({
    where: {
      id: Number(params.flashId),
    },
  });

  const transaction = await prisma.$transaction([
    deleteStamps,
    deleteViewed,
    deleteFlash,
  ]);

  return h.response().code(200);
};

export const flashesHabdler = {
  createFlash,
  deleteFlash,
};
