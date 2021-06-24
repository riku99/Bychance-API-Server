import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import {
  CreateFlashPayload,
  DeleteFlashParams,
} from "~/routes/flashes/validator";
import { createS3ObjectPath } from "~/helpers/aws";
import { serializeFlash } from "~/serializers/flash";
import { throwInvalidError } from "~/helpers/errors";
import { createClientFlashStampValuesData } from "~/helpers/flashes";

const prisma = new PrismaClient();

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
    include: {
      viewed: true,
      stamps: true,
    },
  });

  const defaultStampsData = createClientFlashStampValuesData([], flash.id);

  return {
    flash: serializeFlash({ flash }),
    stamps: defaultStampsData,
  };
};

const deleteFlash = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const params = req.params as DeleteFlashParams;

  await prisma.flashStamp.deleteMany({
    where: {
      flashId: Number(params.flashId),
    },
  });

  await prisma.viewedFlash.deleteMany({
    where: {
      flashId: Number(params.flashId),
    },
  });

  const result = await prisma.flash.deleteMany({
    where: {
      id: Number(params.flashId),
      userId: user.id,
    },
  });

  if (!result.count) {
    return throwInvalidError();
  }

  return h.response().code(200);
};

export const flashesHabdler = {
  createFlash,
  deleteFlash,
};