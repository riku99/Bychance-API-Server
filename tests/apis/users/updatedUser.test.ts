import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createUser } from "../../data/user";
import { prisma } from "../../lib/prisma";
import { createHash } from "~/helpers/crypto";
import { UpdateUserPayload } from "~/routes/users/validator";
import { createS3ObjectPath } from "~/helpers/aws";

const accessToken = "accessToken";
const hashedAccessToken = createHash(accessToken);

const mockedImageUrl = "imageUrl";
const mockedWidth = 100;
const mockedHeight = 100;
jest.mock("~/helpers/aws");
(createS3ObjectPath as any).mockResolvedValue({
  source: mockedImageUrl,
  dimensions: { width: mockedWidth, height: mockedHeight },
});

const url = `${baseUrl}/users`;

const deleteData = async () => {
  await prisma.backGroundItem.deleteMany();
  await prisma.user.deleteMany();
};

describe("ユーザープロフィールの編集, PATCH /users", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
  });

  beforeEach(async () => {
    await deleteData();
  });

  afterAll(async () => {
    await deleteData();
  });

  test("payloadに渡したデータに更新される", async () => {
    const user = await prisma.user.create({
      data: {
        name: "大谷さん",
        lineId: "lineid",
        accessToken: "accessToken",
        youtube: "youtube",
      },
    });

    const newName = "新大谷さん";
    const newAvatarUrl = mockedImageUrl;
    const newIntroduce = "intro";
    const newStatusMessage = "hey";
    const newInstagram = "insragram";
    const newTwitter = "twitter";
    const newYoutube = null;
    const newTikTok = "tiktok";

    const dataForUpdate: UpdateUserPayload = {
      name: newName,
      avatar: newAvatarUrl,
      introduce: newIntroduce,
      instagram: newInstagram,
      twitter: newTwitter,
      youtube: newYoutube,
      tiktok: newTikTok,
      statusMessage: newStatusMessage,
      avatarExt: "png",
      deleteAvatar: false,
      deleteBackGroundItem: false,
      // backGroundItemExt: "png",
      // backGroundItem: "bgItem",
      // backGroundItemType: "video",
    };

    const res = await server.inject({
      method: "PATCH",
      url,
      auth: {
        strategy: "simple",
        credentials: {},
        artifacts: user,
      },
      payload: dataForUpdate,
    });

    const resData = JSON.parse(res.payload);

    expect(resData.name).toEqual(newName);
    expect(resData.avatar).toEqual(newAvatarUrl);
    expect(resData.introduce).toEqual(newIntroduce);
    expect(resData.instagram).toEqual(newInstagram);
    expect(resData.twitter).toEqual(newTwitter);
    expect(resData.youtube).toEqual(newYoutube);
    expect(resData.tiktok).toEqual(newTikTok);
    expect(resData.statusMessage).toEqual(newStatusMessage);

    const newUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    expect(newUser?.name).toEqual(newName);
    expect(newUser?.avatar).toEqual(newAvatarUrl);
    expect(newUser?.introduce).toEqual(newIntroduce);
    expect(newUser?.instagram).toEqual(newInstagram);
    expect(newUser?.twitter).toEqual(newTwitter);
    expect(newUser?.youtube).toEqual(newYoutube);
    expect(newUser?.tiktok).toEqual(newTikTok);
    expect(newUser?.statusMessage).toEqual(newStatusMessage);
  });

  test("backGroundItemを変更した場合はBackGroundItemが作成される", async () => {
    const user = await createUser();

    const type = "video";

    const dataForUpdate = {
      name: "name",
      avatar: "newAvatarUrl",
      introduce: "newIntroduce",
      instagram: "newInstagram",
      twitter: "newTwitter",
      youtube: "newYoutube",
      tiktok: "newTikTok",
      statusMessage: "newStatusMessage",
      avatarExt: "png",
      deleteAvatar: false,
      deleteBackGroundItem: false,
      // backgroundItemの指定
      backGroundItemExt: "png",
      backGroundItem: "bgItem",
      backGroundItemType: type,
    };

    const res = await server.inject({
      method: "PATCH",
      url,
      auth: {
        strategy: "simple",
        credentials: {},
        artifacts: user,
      },
      payload: dataForUpdate,
    });

    const createdBackGroundItem = await prisma.backGroundItem.findFirst({
      where: {
        userId: user.id,
      },
    });

    expect(JSON.parse(res.payload).backGroundItem).toEqual({
      id: createdBackGroundItem?.id,
      url: mockedImageUrl,
      width: mockedWidth,
      height: mockedHeight,
      type,
      userId: user.id,
    });

    expect(createdBackGroundItem?.url).toEqual(mockedImageUrl);
    expect(createdBackGroundItem?.width).toEqual(mockedWidth);
    expect(createdBackGroundItem?.height).toEqual(mockedHeight);
    expect(createdBackGroundItem?.type).toEqual(type);
  });

  test("deleteをtrueにした場合、avatar, backgroundItemどちらも削除される", async () => {
    const user = await createUser({
      avatar: "avatar",
    });

    const backGroundItem = await prisma.backGroundItem.create({
      data: {
        url: "url",
        width: 100,
        height: 100,
        type: "image",
        userId: user.id,
      },
    });

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        backGroundItemId: backGroundItem.id,
      },
    });

    const dataForUpdate = {
      name: "name",
      avatar: "newAvatarUrl",
      introduce: "newIntroduce",
      instagram: "newInstagram",
      twitter: "newTwitter",
      youtube: "newYoutube",
      tiktok: "newTikTok",
      statusMessage: "newStatusMessage",
      avatarExt: "png",
      backGroundItemExt: "png",
      backGroundItem: "bgItem",
      backGroundItemType: "video",
      // どちらもtrue
      deleteAvatar: true,
      deleteBackGroundItem: true,
    };

    const res = await server.inject({
      method: "PATCH",
      url,
      auth: {
        strategy: "simple",
        credentials: {},
        artifacts: user,
      },
      payload: dataForUpdate,
    });

    const bg = await prisma.backGroundItem.findFirst({
      where: {
        userId: user.id,
      },
    });

    expect(JSON.parse(res.payload).avatar).toBeNull();
    expect(JSON.parse(res.payload).backGroundItem).toBeNull();

    expect(bg).toBeNull();
  });

  test.only("avatar, backgroundImageのデータを持たせない場合はそれぞれ変化しない", async () => {
    const user = await createUser({
      avatar: "avatar",
    });

    const backgroundItem = await prisma.backGroundItem.create({
      data: {
        url: "url",
        type: "image",
        width: 100,
        height: 100,
        userId: user.id,
      },
    });

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        backGroundItemId: backgroundItem.id,
      },
    });

    // avatarのデータとbackgroundItemのデータ入れてない
    const dataForUpdate = {
      name: "name",
      introduce: "newIntroduce",
      instagram: "newInstagram",
      twitter: "newTwitter",
      youtube: "newYoutube",
      tiktok: "newTikTok",
      statusMessage: "newStatusMessage",
      avatarExt: "png",
      deleteAvatar: false,
      deleteBackGroundItem: false,
    };

    const res = await server.inject({
      method: "PATCH",
      url,
      auth: {
        strategy: "simple",
        credentials: {},
        artifacts: user,
      },
      payload: dataForUpdate,
    });

    const bi = await prisma.backGroundItem.findFirst({
      where: {
        userId: user.id,
      },
    });

    const u = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    expect(JSON.parse(res.payload).avatar).toEqual(user.avatar);
    expect(JSON.parse(res.payload).backGroundItem).toEqual(backgroundItem);
    expect(bi?.id).toEqual(backgroundItem.id);
    expect(u?.backGroundItemId).toEqual(bi?.id);
  });
});
