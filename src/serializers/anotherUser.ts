import { User, Post, Flash, ViewedFlash } from "@prisma/client";

import { serializeUser } from "./user";
import { serializePost } from "./post";
import { serializeFlash } from "./flash";
import { dayMs } from "~/constants/date";

type A = {
  user: User;
  posts: Post[];
  flashes: Flash[];
  viewedFlashes: ViewedFlash[];
};

export const serializeAnotherUser = ({ user, posts, flashes }: A) => {
  const { id, name, avatar, introduce, statusMessage } = user;
  const serializedPosts = posts.map((post) => serializePost({ post }));

  // あとでcreateClientDataのものとまとめる
  // DBから取り出す段階で指定できそう
  const notExpiredFlashes = flashes.filter(
    (flash) =>
      (new Date().getTime() - new Date(flash.createdAt).getTime()) / dayMs < 2 // 作成してから2日以内の物を取り出す
  );
};
