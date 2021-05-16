import { User, Post, Flash, ViewedFlash } from "@prisma/client";

import { serializePost } from "~/serializers/post";
import { serializeFlash } from "~/serializers/flash";
import { AnotherUser } from "~/types/anotherUser";
import { filterByDayDiff } from "~/helpers/clientData";

type Arg = {
  user: User;
  posts: Post[];
  flashes: Flash[];
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
  };
};
