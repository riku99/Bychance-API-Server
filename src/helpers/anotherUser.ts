import { User, Post, Flash, ViewedFlash, FlashStamp } from "@prisma/client";

import { serializePost } from "~/serializers/post";
import { serializeFlash } from "~/serializers/flash";
import { AnotherUser } from "~/types/anotherUser";
import { filterByDayDiff } from "~/helpers/clientData";
import { handleUserLocationCrypt } from "~/helpers/crypto";

type Arg = {
  user: User;
  posts: Post[];
  flashes: (Flash & { viewed: ViewedFlash[]; stamps: FlashStamp[] })[];
  viewedFlashes: ViewedFlash[]; // 返すユーザーではなく、自分(リクエストした側)のものを渡す
};

export const createAnotherUser = ({
  user,
  posts,
  flashes,
  viewedFlashes,
}: Arg): AnotherUser => {
  const {
    id,
    name,
    avatar,
    introduce,
    statusMessage,
    backGroundItem,
    backGroundItemType,
    instagram,
    twitter,
    youtube,
    tiktok,
    lat: _lat,
    lng: _lng,
  } = user;

  const serializedPosts = posts.map((post) => serializePost({ post }));

  const viewedFlashIds = viewedFlashes.map(
    (viewedFlash) => viewedFlash.flashId
  );

  const alreadyViewedIds: number[] = [];

  const notExpiredFlashes = flashes.filter((flash) => {
    const include = filterByDayDiff(flash.createdAt);

    if (include) {
      if (viewedFlashIds.includes(flash.id)) {
        alreadyViewedIds.push(flash.id);
      }
    }

    return include;
  });

  const lastId =
    notExpiredFlashes.length &&
    notExpiredFlashes[notExpiredFlashes.length - 1].id;

  const isAllAlreadyViewed = alreadyViewedIds.includes(lastId);

  const serializedFlashes = notExpiredFlashes.map((flash) =>
    serializeFlash({ flash })
  );

  const flashesData = {
    entities: serializedFlashes,
    alreadyViewed: alreadyViewedIds,
    isAllAlreadyViewed,
  };

  let decryptedLat: number | null = null;
  let decryptedLng: number | null = null;

  if (_lat && _lng) {
    const { lat, lng } = handleUserLocationCrypt(_lat, _lng, "decrypt");

    decryptedLat = lat;
    decryptedLng = lng;
  }

  return {
    id,
    name,
    avatar,
    introduce,
    statusMessage,
    backGroundItem,
    instagram,
    twitter,
    youtube,
    tiktok,
    backGroundItemType,
    posts: serializedPosts,
    flashes: flashesData,
    lat: decryptedLat,
    lng: decryptedLng,
  };
};
