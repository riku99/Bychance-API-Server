import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { throwInvalidError } from "~/helpers/errors";
import {
  CreateFlashStampPayload,
  GetParams,
} from "~/routes/flashStamps/validator";

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

const get = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const params = req.params as GetParams;

  const stamps = await prisma.flashStamp.findMany({
    where: {
      flashId: Number(params.flashId),
    },
  });

  let data: {
    [key: string]: {
      userIds: string[];
    };
  } = {};
  stamps.forEach((d) => {
    if (data[d.value]) {
      data[d.value].userIds.push(d.userId);
    } else {
      data[d.value] = { userIds: [d.userId] };
    }
  });

  return data;
};

export const handlers = {
  createFlashStamp,
  get,
};
