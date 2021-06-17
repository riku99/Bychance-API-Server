import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import distance from "@turf/distance";
import { point } from "@turf/helpers";

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

  // プライベートゾーンを追加したということは、それまでプライベートゾーン内にはいなかったがこの追加によりプライベートゾーン内にいる状態に変化する可能性がある。それを検証する
  if (user.lat && user.lng && !user.inPrivateZone) {
    const decryptCurrentLatLng = handleUserLocationCrypt(
      user.lat,
      user.lng,
      "decrypt"
    );
    const privatePoint = point([payload.lng, payload.lat]);
    const currentUserPoint = point([
      decryptCurrentLatLng.lng,
      decryptCurrentLatLng.lat,
    ]);
    const distanceResult = distance(privatePoint, currentUserPoint);

    if (distanceResult <= Number(process.env.PRIVATE_ZONE_RANGE)) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          inPrivateZone: true,
        },
      });
    }
  }

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

  const currentPrivateZone = await prisma.privateZone.findMany({
    where: {
      userId: user.id,
    },
  });

  // プライベートゾーンを削除したということは、プライベートゾーン内にいる状態からそうでなくなる可能性がある。つまりinPrivateZoneがtrue -> falseになる可能性があるのでそれを検証
  if (user.lat && user.lng && user.inPrivateZone) {
    const decryptCurrentLatLng = handleUserLocationCrypt(
      user.lat,
      user.lng,
      "decrypt"
    );

    const userCurrentPoint = point([
      decryptCurrentLatLng.lng,
      decryptCurrentLatLng.lat,
    ]);

    const inPrivateZone = currentPrivateZone.find((p) => {
      const decryptPrivateLatLng = handleUserLocationCrypt(
        p.lat,
        p.lng,
        "decrypt"
      );
      const privatePoint = point([
        decryptPrivateLatLng.lng,
        decryptPrivateLatLng.lat,
      ]);

      const distanceResult = distance(privatePoint, userCurrentPoint);

      return distanceResult <= Number(process.env.PRIVATE_ZONE_RANGE);
    });

    if (!inPrivateZone) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          inPrivateZone: false,
        },
      });
    }
  }

  return h.response().code(200);
};

export const privateZoneHandler = {
  getPrivateZone,
  createPrivateZone,
  deletePrivateZone,
};
