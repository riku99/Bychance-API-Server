import { User, Post, Flash, ViewedFlash } from "@prisma/client";

import { serializePost } from "~/serializers/post";
import { serializeFlash } from "~/serializers/flash";
import { dayMs } from "~/constants/date";
import { AnotherUser } from "~/types/anotherUser";

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
  } = user;

  const serializedPosts = posts.map((post) => serializePost({ post }));

  const viewedFlashIds = viewedFlashes.map(
    (viewedFlash) => viewedFlash.flashId
  );

  const alreadyViewedIds: number[] = [];

  const notExpiredFlashes = flashes.filter((flash) => {
    if (viewedFlashIds.includes(flash.id)) {
      alreadyViewedIds.push(flash.id);
    }

    return (
      // 作成してから2日以内の物を取り出す
      // あとでcreateClientDataのものとまとめる
      // DBから取り出す段階で指定できそう
      (new Date().getTime() - new Date(flash.createdAt).getTime()) / dayMs < 2
    );
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
    backGroundItemType,
    posts: serializedPosts,
    flashes: flashesData,
  };
};
