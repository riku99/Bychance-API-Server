import { Post } from "@prisma/client";

import { serializePost } from "~/serializers/posts";
import { ClientPost } from "~/types/clientData";

const post: Post = {
  id: 1,
  image: "image",
  text: "text",
  createdAt: new Date("2021-04-29T07:11:50.036Z"),
  updatedAt: new Date("2021-04-29T07:11:50.036Z"),
  userId: "userId",
};

const clientPost: ClientPost = {
  id: 1,
  image: "image",
  text: "text",
  userId: "userId",
  date: "2021/4/29",
};

describe("posts serializer", () => {
  test("clentPostを返す", () => {
    const result = serializePost({ post });

    expect(result).toEqual(clientPost);
  });
});
