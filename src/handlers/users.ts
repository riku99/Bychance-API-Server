import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import distance from "@turf/distance";
import { point } from "@turf/helpers";
import geohash from "ngeohash";

import { Artifacts } from "~/auth/bearer";
import {
  UpdateUserPayload,
  RefreshUserParams,
  UpdateLocationPayload,
  ChangeUserDisplayPayload,
  ChangeVideoEditDescriptionPayload,
  ChangeTalkRoomMessageReceipt,
  ChangeShowReceiveMessage,
  GetUserParams,
} from "~/routes/users/validator";
import { serializeUser } from "~/serializers/user";
import { createS3ObjectPath } from "~/helpers/aws";
import { throwInvalidError } from "~/helpers/errors";
import { handleUserLocationCrypt, createHash } from "~/helpers/crypto";
import { createAnotherUser } from "~/helpers/anotherUser";
import { flashIncludes, postIncludes } from "~/prisma/includes";
import {
  createClientFlashes,
  createClientFlashStamps,
} from "~/helpers/flashes";
import { createClientPosts } from "~/helpers/posts";
import { geohashPrecision } from "~/constants";
import Joi from "joi";
import { GetParams } from "~/routes/talkRooms/validator";
import { user } from "~/../tests/data";

const prisma = new PrismaClient();

const updateUser = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const {
    deleteAvatar,
    deleteBackGroundItem,
    avatarExt,
    backGroundItemExt,
    ...userData
  } = req.payload as UpdateUserPayload;

  let newAvatar: string | null;
  let newBackGroundItem: string | null;
  let newBackGroundItemType: "image" | "video" | null;

  if (userData.avatar && avatarExt && !deleteAvatar) {
    const result = await createS3ObjectPath({
      data: userData.avatar,
      domain: "avatar",
      id: user.id,
      ext: avatarExt,
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
  if (userData.backGroundItem && backGroundItemExt && !deleteBackGroundItem) {
    const result = await createS3ObjectPath({
      data: userData.backGroundItem,
      domain: "backGroundItem",
      id: user.id,
      sourceType: userData.backGroundItemType,
      ext: backGroundItemExt,
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
  const params = req.params as RefreshUserParams;

  const isMyData = user.id === params.userId;

  const refreshData = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      ...postIncludes,
      ...flashIncludes,
    },
  });

  if (!refreshData) {
    return throwInvalidError("ユーザーが存在しません");
  }

  if (isMyData) {
    const { posts: _posts, flashes: _flashes, ...restUserData } = refreshData;
    const user = serializeUser({ user: restUserData });
    const posts = createClientPosts(_posts);
    const flashes = createClientFlashes(_flashes);
    const flashStamps = createClientFlashStamps(_flashes);

    return {
      isMyData,
      user,
      posts,
      flashes,
      flashStamps,
    };
  } else {
    const viewedFlashes = await prisma.viewedFlash.findMany({
      where: {
        userId: user.id,
      },
    });
    const { posts, flashes, ...userData } = refreshData;
    const flashStamps = createClientFlashStamps(flashes);

    const data = createAnotherUser({
      user: userData,
      posts,
      flashes,
      viewedFlashes,
    });

    return {
      isMyData,
      data: {
        user: data,
        flashStamps,
      },
    };
  }
};

const updateLocation = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as UpdateLocationPayload;

  const gh = geohash.encode(payload.lat, payload.lng, geohashPrecision);
  const gh7 = geohash.encode(payload.lat, payload.lng, 7);
  const hashedGh = createHash(gh);
  const hashedGh7 = createHash(gh7);

  const cryptedLocation = handleUserLocationCrypt(
    payload.lat,
    payload.lng,
    "encrypt"
  );

  const currentPrivateZone = await prisma.privateZone.findMany({
    where: {
      userId: user.id,
    },
  });

  const newPoint = point([payload.lng, payload.lat]);

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

    const distanceResult = distance(privatePoint, newPoint);

    return distanceResult <= Number(process.env.PRIVATE_ZONE_RANGE);
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...cryptedLocation,
      inPrivateZone: !!inPrivateZone,
      geohash: hashedGh,
      geohash7: hashedGh7,
    },
  });

  return h.response().code(200);
};

const deleteLocation = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lat: null,
        lng: null,
        geohash: null,
        geohash7: null,
        inPrivateZone: false,
      },
    });
  } catch {
    return throwInvalidError("削除に失敗しました");
  }

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

const changeTalkRoomMessageReceipt = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as ChangeTalkRoomMessageReceipt;

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        talkRoomMessageReceipt: payload.receipt,
      },
    });
  } catch {}

  return h.response().code(200);
};

const changeShowReceiveMessage = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as ChangeShowReceiveMessage;

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        showReceiveMessage: payload.showReceiveMessage,
      },
    });
  } catch {
    return throwInvalidError("変更に失敗しました");
  }

  return h.response().code(200);
};

const getUserPageInfo = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const me = req.auth.artifacts as Artifacts;
  const params = req.params as GetUserParams;

  const user = await prisma.user.findUnique({
    where: {
      id: params.userId,
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      introduce: true,
      backGroundItem: true,
      backGroundItemType: true,
      instagram: true,
      twitter: true,
      youtube: true,
      tiktok: true,
      posts: {
        orderBy: {
          createdAt: "desc",
        },
      },
      flashes: {
        include: {
          stamps: true,
          viewed: {
            select: {
              userId: true,
            },
          },
          specificUserViewed: {
            where: {
              userId: me.id,
            },
            select: {
              flashId: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return throwInvalidError();
  }

  const viewerViewedFlasheIds = user.flashes
    .map((f) => f.specificUserViewed)
    .filter((f) => f.length)
    .map((f) => f[0].flashId);
  const viewedAllFlashes = viewerViewedFlasheIds.length === user.flashes.length;

  const { flashes, ...restData } = user;

  return {
    ...restData,
    flashesData: {
      entities: user.flashes,
      viewerViewedFlasheIds,
      viewedAllFlashes,
    },
  };
};

export const handlers = {
  updateUser,
  refreshUser,
  updateLocation,
  changeDisplay,
  changeVideoEditDescription,
  changeTalkRoomMessageReceipt,
  changeShowReceiveMessage,
  deleteLocation,
  getUserPageInfo,
};
