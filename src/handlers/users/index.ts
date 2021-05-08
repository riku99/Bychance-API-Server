import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import {
  UpdateUserPayload,
  RefreshUserPayload,
  UpdateLocationPayload,
  ChangeUserDisplayPayload,
} from "~/routes/users/validator";
import { serializeUser } from "~/serializers/user";
import { createS3ObjectPath } from "~/helpers/aws";
import { throwInvalidError } from "~/helpers/errors";
import { handleUserLocationCrypt } from "~/helpers/crypto";

const prisma = new PrismaClient();

const updateUser = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const {
    deleteAvatar,
    deleteBackGroundItem,
    backGroundItemExt,
    ...userData
  } = req.payload as UpdateUserPayload;

  let newAvatar: string | null;
  let newBackGroundItem: string | null;
  let newBackGroundItemType: "image" | "video" | null;

  if (userData.avatar) {
    const result = await createS3ObjectPath({
      data: userData.avatar,
      domain: "avatar",
      id: user.id,
      ext: "jpeg",
    });

    newAvatar = result ? result : user.avatar;
  } else {
    if (deleteAvatar) {
      newAvatar = null;
    } else {
      newAvatar = user.avatar;
    }
  }

  if (userData.backGroundItem) {
    const result = await createS3ObjectPath({
      data: userData.backGroundItem,
      domain: "backGroundItem",
      id: user.id,
      ext: backGroundItemExt,
    });

    newBackGroundItem = result;
    newBackGroundItemType = userData.backGroundItemType
      ? userData.backGroundItemType
      : null;
  } else {
    if (deleteBackGroundItem) {
      newBackGroundItem = null;
      newBackGroundItemType = null;
    } else {
      newBackGroundItem = user.backGroundItem;
      newBackGroundItemType = user.backGroundItemType;
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...user,
      ...userData,
      avatar: newAvatar,
      backGroundItem: newBackGroundItem,
      backGroundItemType: newBackGroundItemType,
    },
  });

  return serializeUser({ user: updatedUser });
};

const refreshUser = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as RefreshUserPayload;

  const refreshedUser = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!refreshedUser) {
    return throwInvalidError("ユーザーが存在しません");
  }

  // リフレッシュの対象が自分か他のユーザーかで処理分ける
  if (user.id === payload.userId) {
    const data = serializeUser({ user: refreshedUser });
    return {
      isMyData: true,
      data,
    };
  } else {
    // 他のユーザーの場合の処理
  }
};

const updateLocation = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as UpdateLocationPayload;

  const cryptedLocation = handleUserLocationCrypt(
    payload.lat,
    payload.lng,
    "encrypt"
  );

  await prisma.user.update({
    where: { id: user.id },
    data: cryptedLocation,
  });

  return h.response().code(200);
};

const changeDisplay = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as ChangeUserDisplayPayload;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      display: payload.display,
    },
  });

  return h.response().code(200);
};

export const usersHandler = {
  updateUser,
  refreshUser,
  updateLocation,
  changeDisplay,
};
