import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import {
  UpdateUserPayload,
  RefreshUserPayload,
  UpdateLocationPayload,
  ChangeUserDisplayPayload,
  ChangeVideoEditDescriptionPayload,
} from "~/routes/users/validator";
import { serializeUser } from "~/serializers/user";
import { createS3ObjectPath } from "~/helpers/aws";
import { throwInvalidError } from "~/helpers/errors";
import { handleUserLocationCrypt } from "~/helpers/crypto";
import { createAnotherUser } from "~/helpers/anotherUser";

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

  if (userData.avatar && userData.avatarExt) {
    const result = await createS3ObjectPath({
      data: userData.avatar,
      domain: "avatar",
      id: user.id,
      ext: userData.avatarExt,
    });

    newAvatar = result ? result.source : user.avatar;
  } else {
    if (deleteAvatar) {
      newAvatar = null;
    } else {
      newAvatar = user.avatar;
    }
  }

  // backGroundItemが存在するということは更新することを表す。もし存在しない場合は更新しない。
  if (userData.backGroundItem && userData.avatarExt) {
    const result = await createS3ObjectPath({
      data: userData.backGroundItem,
      domain: "backGroundItem",
      id: user.id,
      sourceType: userData.backGroundItemType,
      ext: userData.avatarExt,
    });

    if (!result) {
      throw new Error();
    }

    newBackGroundItem = result.source;
    newBackGroundItemType = userData.backGroundItemType
      ? userData.backGroundItemType
      : null;
  } else {
    // backGroundItemが存在しない場合は「削除する」と「変更なし」の2種類がある。この判断はdeleteBackGroundItemで行う
    if (deleteBackGroundItem) {
      // 削除の場合nullを代入
      newBackGroundItem = null;
      newBackGroundItemType = null;
    } else {
      // 変更なしの場合現在のデータを指定
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

  const isMyData = user.id === payload.userId;

  const refreshedUser = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      posts: isMyData
        ? false
        : {
            orderBy: {
              createdAt: "desc",
            },
          },
      flashes: isMyData ? false : true,
    },
  });

  if (!refreshedUser) {
    return throwInvalidError("ユーザーが存在しません");
  }

  if (isMyData) {
    const data = serializeUser({ user: refreshedUser });

    return {
      isMyData,
      data,
    };
  } else {
    const viewedFlashes = await prisma.viewedFlash.findMany({
      where: {
        userId: user.id,
      },
    });
    const { posts, flashes, ...userData } = refreshedUser;
    const data = createAnotherUser({
      user: userData,
      posts,
      flashes,
      viewedFlashes,
    });

    return {
      isMyData,
      data,
    };
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

const changeVideoEditDescription = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as ChangeVideoEditDescriptionPayload;

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        videoEditDescription: payload.videoEditDescription,
      },
    });
  } catch {}

  return h.response().code(200);
};

export const usersHandler = {
  updateUser,
  refreshUser,
  updateLocation,
  changeDisplay,
  changeVideoEditDescription,
};
