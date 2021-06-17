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

  const userLatLng = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      lat: true,
      lng: true,
    },
  });

  if (!userLatLng) {
    return throwInvalidError();
  }

  let decryptCurrentLatLng: { lat: number; lng: number } | null = null;

  if (userLatLng.lat && userLatLng.lng) {
    decryptCurrentLatLng = handleUserLocationCrypt(
      userLatLng.lat,
      userLatLng.lng,
      "decrypt"
    );
  }

  if (decryptCurrentLatLng) {
    // 新たに作成されたゾーンと現在のサーバーにあるユーザーの位置情報データを使いゾーン内にいる場合は更新する
    const privatePoint = point([payload.lng, payload.lat]);
    const currentUserPoint = point([
      decryptCurrentLatLng.lng,
      decryptCurrentLatLng.lat,
    ]);
    const distanceResult = distance(privatePoint, currentUserPoint);

    console.log("プライベートゾーンとの距離: " + distanceResult);

    if (distanceResult <= Number(process.env.PRIVATE_ZONE_RANGE)) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          inPrivateZone: true,
        },
      });
      console.log("trueになりました");
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

  return h.response().code(200);
};

export const privateZoneHandler = {
  getPrivateZone,
  createPrivateZone,
  deletePrivateZone,
};
