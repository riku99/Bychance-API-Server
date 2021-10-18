import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createUser } from "../../data/user";
import { prisma } from "../../lib/prisma";
import { createPost } from "../../data/posts";
import { createFlash } from "../../data/flash";
import { createBlock } from "../../data/block";

const deleteUser = async () => {
  await prisma.post.deleteMany();
  await prisma.flash.deleteMany();
  await prisma.block.deleteMany();
  await prisma.user.deleteMany();
};

const url = ({
  targetUserId,
  requestUserId,
}: {
  targetUserId: string;
  requestUserId: string;
}) => `${baseUrl}/users/${targetUserId}/page_info?id=${requestUserId}`;

describe("ユーザーページデータ取得, GET /users/{userId}/page_info", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
  });

  beforeEach(async () => {
    await deleteUser();
  });

  afterAll(async () => {
    await deleteUser();
  });

  test("指定したユーザーのデータを返す", async () => {
    const requestUser = await createUser();

    const targetUser = await createUser();

    const targetUserPost = await createPost({
      userId: targetUser.id,
    });

    const targetUserFlash = await createFlash({
      userId: targetUser.id,
    });

    const res = await server.inject({
      method: "GET",
      url: url({
        targetUserId: targetUser.id,
        requestUserId: requestUser.id,
      }),
      auth: {
        strategy: "simple",
        credentials: {},
        artifacts: requestUser,
      },
    });

    const resData = JSON.parse(res.payload);
    const postData = resData.posts;
    const responseFlashData = resData.flashes;

    expect(resData.id).toEqual(targetUser.id);
    expect(resData.name).toEqual(targetUser.name);
    expect(resData.avatar).toEqual(targetUser.avatar);
    expect(resData.introduce).toEqual(targetUser.introduce);
    expect(resData.instagram).toEqual(targetUser.instagram);
    expect(resData.twitter).toEqual(targetUser.twitter);
    expect(resData.youtube).toEqual(targetUser.youtube);
    expect(resData.tiktok).toEqual(targetUser.tiktok);
    expect(resData.blockTo).toBeFalsy();

    expect(postData[0].id).toEqual(targetUserPost.id);
    expect(postData[0].text).toEqual(targetUserPost.text);
    expect(postData[0].url).toEqual(targetUserPost.url);
    expect(postData[0].sourceType).toEqual(targetUserPost.sourceType);
    expect(postData[0].userId).toEqual(targetUserPost.userId);
    expect(new Date(postData[0].createdAt)).toEqual(
      new Date(targetUserPost.createdAt)
    );

    expect(responseFlashData[0].id).toEqual(targetUserFlash.id);
    expect(responseFlashData[0].source).toEqual(targetUserFlash.source);
    expect(responseFlashData[0].sourceType).toEqual(targetUserFlash.sourceType);
    expect(responseFlashData[0].userId).toEqual(targetUserFlash.userId);
    expect(responseFlashData[0].viewed).toEqual([]);
    expect(new Date(responseFlashData[0].createdAt)).toEqual(
      new Date(targetUserFlash.createdAt)
    );
  });

  test("リクエストユーザーが対象のユーザーをブロックしている場合、PostやFlashは空が返される", async () => {
    const requestUser = await createUser();

    const targetUser = await createUser();

    await createPost({
      userId: targetUser.id,
    });

    await createFlash({
      userId: targetUser.id,
    });

    await createBlock({
      blockBy: requestUser.id,
      blockTo: targetUser.id,
    });

    const res = await server.inject({
      method: "GET",
      url: url({
        targetUserId: targetUser.id,
        requestUserId: requestUser.id,
      }),
      auth: {
        strategy: "simple",
        credentials: {},
        artifacts: requestUser,
      },
    });

    const responseData = JSON.parse(res.payload);

    expect(responseData.blockTo).toBeTruthy();
    // ブロックしているので作成したにもかかわらずどちらも空
    expect(responseData.posts).toEqual([]);
    expect(responseData.flashes).toEqual([]);
  });

  test("リクエストユーザーが対象のユーザーにブロックされている場合、PostやFlashは空が返される", async () => {
    const requestUser = await createUser();
    const targetUser = await createUser();
    await createPost({ userId: targetUser.id });
    await createFlash({ userId: targetUser.id });

    // リクエストしたユーザーがブロックされている
    await createBlock({
      blockBy: targetUser.id,
      blockTo: requestUser.id,
    });

    const res = await server.inject({
      method: "GET",
      url: url({
        targetUserId: targetUser.id,
        requestUserId: requestUser.id,
      }),
      auth: {
        strategy: "simple",
        credentials: {},
        artifacts: requestUser,
      },
    });

    expect(JSON.parse(res.payload).posts).toEqual([]);
    expect(JSON.parse(res.payload).flashes).toEqual([]);
  });
});
