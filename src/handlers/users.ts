import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import distance from "@turf/distance";
import { point } from "@turf/helpers";
import geohash from "ngeohash";

import { Artifacts } from "~/auth/bearer";
import {
  UpdateUserPayload,
  UpdateLocationPayload,
  GetUserParams,
  ChangeTooltipOfUsersDisplayShowedPayload,
  ChangeGroupsApplicationEnabled,
} from "~/routes/users/validator";
import { createS3ObjectPath } from "~/helpers/aws";
import { throwInvalidError } from "~/helpers/errors";
import { handleUserLocationCrypt, createHash } from "~/helpers/crypto";
import { geohashPrecision } from "~/constants";
import { getUserIsInPrivateTime } from "~/helpers/privateTime";
import { groupMemberWhoBlockTargetUserExists } from "~/models/groups";

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
    select: {
      id: true,
      name: true,
      avatar: true,
      introduce: true,
      statusMessage: true,
      backGroundItem: true,
      backGroundItemType: true,
      instagram: true,
      twitter: true,
      youtube: true,
      tiktok: true,
    },
  });

  return updatedUser;
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

const getUserPageInfo = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const requestUser = req.auth.artifacts as Artifacts;
  const params = req.params as GetUserParams;

  const targetUser = await prisma.user.findUnique({
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
          viewed: {
            select: {
              userId: true,
            },
          },
        },
      },
      blocks: {
        select: {
          blockTo: true,
        },
      },
      blocked: {
        select: {
          blockBy: true,
        },
      },
    },
  });

  if (!targetUser) {
    return throwInvalidError();
  }

  const { blocked, blocks, ...userwithoutBlockData } = targetUser;

  const blockTo = blocked.some((b) => b.blockBy === requestUser.id); // リクエストしたユーザーが取得したユーザーをブロックしてるかどうか
  const blockBy = blocks.some((b) => b.blockTo === requestUser.id); // リクエストしたユーザーが取得したユーザーにブロックされているかどうか
  const block = blockTo || blockBy;

  return {
    ...userwithoutBlockData,
    posts: block ? [] : targetUser.posts,
    flashes: block ? [] : targetUser.flashes,
    introduce: block ? "" : targetUser.introduce,
    instagram: block ? null : targetUser.instagram,
    twitter: block ? null : targetUser.twitter,
    youtube: block ? null : targetUser.youtube,
    tiktok: block ? null : targetUser.tiktok,
    blockTo,
  };
};

const refreshMyData = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;

  const data = await prisma.user.findUnique({
    where: {
      id: user.id,
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
      videoEditDescription: true,
      statusMessage: true,
      lat: true,
      lng: true,
      display: true,
      talkRoomMessageReceipt: true,
      showReceiveMessage: true,
      posts: {
        orderBy: {
          createdAt: "desc",
        },
      },
      flashes: {
        include: {
          viewed: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!data) {
    return throwInvalidError();
  }

  const { posts, flashes, ...userData } = data;
  const { lat, lng, ...restUserData } = userData;
  let decryptedLat: number | null = null;
  let decryptedLng: number | null = null;
  if (lat && lng) {
    const { lat: _lat, lng: _lng } = handleUserLocationCrypt(
      lat,
      lng,
      "decrypt"
    );

    decryptedLat = _lat;
    decryptedLng = _lng;
  }

  return {
    ...userData,
    lat: decryptedLat,
    lng: decryptedLng,
    posts,
    flashes,
  };
};

const changeTooltipOfUsersDisplayShowed = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as ChangeTooltipOfUsersDisplayShowedPayload;

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      tooltipOfUsersDisplayShowed: payload.value,
    },
  });

  return h.response().code(200);
};

// リクエストしたユーザーが現在他のユーザーに表示されている状態であるかどうか
const isDisplayed = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;

  const privateTimes = await prisma.privateTime.findMany({
    where: {
      userId: user.id,
    },
  });

  const inPrivateTime = getUserIsInPrivateTime(privateTimes);

  return (
    user.login &&
    user.display &&
    !!user.lat &&
    !!user.lng &&
    !user.inPrivateZone &&
    !inPrivateTime
  );
};

const changeGroupsApplicationEnabled = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as ChangeGroupsApplicationEnabled;

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      groupsApplicationEnabled: payload.value,
    },
  });

  return h.response().code(200);
};

const deleteGroupId = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;

  if (!user.groupId) {
    return throwInvalidError("グループに入っていません");
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      groupId: null,
    },
  });

  return h.response().code(200);
};

export const handlers = {
  updateUser,
  updateLocation,
  deleteLocation,
  getUserPageInfo,
  refreshMyData,
  changeTooltipOfUsersDisplayShowed,
  isDisplayed,
  changeGroupsApplicationEnabled,
  deleteGroupId,
};
