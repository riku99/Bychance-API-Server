import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { throwInvalidError } from "~/helpers/errors";
import {
  CreatePrivateZonePayload,
  DeletePrivateZoneParams,
} from "~/routes/privateZone/validator";
import { handleUserLocationCrypt, handleAddressCrypt } from "~/helpers/crypto";

const prisma = new PrismaClient();

const getPrivateZone = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;

  const privateZone = await prisma.privateZone.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      address: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const decryptProvateZone = privateZone.map((z) => {
    const decryptAddress = handleAddressCrypt(z.address, "decrypt");
    return {
      id: z.id,
      address: decryptAddress,
    };
  });

  return decryptProvateZone;
};

const createPrivateZone = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreatePrivateZonePayload;

  const cryptoResult = handleUserLocationCrypt(
    payload.lat,
    payload.lng,
    "encrypt"
  );

  const cryptoAddress = handleAddressCrypt(payload.address, "encrypt");

  const result = await prisma.privateZone.create({
    data: {
      userId: user.id,
      lat: cryptoResult.lat,
      lng: cryptoResult.lng,
      address: cryptoAddress,
    },
  });

  return {
    id: result.id,
    address: payload.address,
  };
};

const deletePrivateZone = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const params = req.params as DeletePrivateZoneParams;

  const result = await prisma.privateZone.deleteMany({
    where: {
      id: Number(params.id),
      userId: user.id,
    },
  });

  if (!result.count) {
    return throwInvalidError();
  }

  return h.response().code(200);
};

export const privateZoneHandler = {
  getPrivateZone,
  createPrivateZone,
  deletePrivateZone,
};
