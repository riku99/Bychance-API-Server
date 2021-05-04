import { User, Post, Flash, ViewedFlash } from "@prisma/client";

import { createAnotherUser } from "~/helpers/anotherUser";
import { AnotherUser } from "~/types/anotherUser";
import { ClientPost, ClientFlash } from "~/types/clientData";

const user: User = {
  id: "1",
  name: "コベニ",
  accessToken: "token",
  lineId: "lineId",
  introduce: "hello",
  avatar: "image url",
  statusMessage: "hey",
  display: false,
  lat: "1",
  lng: "1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const post: Post = {
  id: 1,
  text: "Wow",
  image: "url",
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: "1",
};

const serializedPost: ClientPost = {
  id: post.id,
  text: post.text,
  image: "url",
  date: "date",
  userId: "1",
};

const flash: Flash = {
  id: 1,
  source: "url",
  sourceType: "image",
  userId: "1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const serializedFlash: ClientFlash = {
  id: flash.id,
  source: flash.source,
  sourceType: flash.sourceType,
  timestamp: "timestamp",
};

const viewedFlash: ViewedFlash = {
  id: 1,
  userId: "2",
  flashId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const expectedResult: AnotherUser = {
  id: user.id,
  name: user.name,
  avatar: user.avatar,
  introduce: user.introduce,
  statusMessage: user.statusMessage,
  posts: [serializedPost],
  flashes: {
    entities: [serializedFlash],
    alreadyViewed: [1],
    isAllAlreadyViewed: true,
  },
};

describe("createAnotherUser", () => {
  test("expectedResultを返す", () => {
    const result = createAnotherUser({
      user,
      posts: [post],
      flashes: [flash],
      viewedFlashes: [viewedFlash],
    });

    console.log(result);

    result.posts[0].date = serializedPost.date;
    result.flashes.entities[0].timestamp = serializedFlash.timestamp;

    expect(result).toEqual(expectedResult);
  });
});
