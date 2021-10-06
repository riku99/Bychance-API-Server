import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createHash } from "~/helpers/crypto";
import { createS3ObjectPath } from "~/helpers/aws";
import { UpdateUserPayload } from "~/routes/users/validator";

const prisma = new PrismaClient();

const accessToken = "accessToken";
const hashedAccessToken = createHash(accessToken);

const mockedImageUrl = "imageUrl";
jest.mock("~/helpers/aws");
(createS3ObjectPath as any).mockResolvedValue({
  source: mockedImageUrl,
});

const deleteData = async () => {
  await prisma.privateZone.deleteMany();
  await prisma.post.deleteMany();
  await prisma.flash.deleteMany();
  await prisma.block.deleteMany();
  await prisma.user.deleteMany({});
};

describe("users", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
    await deleteData();
  });

  beforeEach(async () => {
    await deleteData();
  });

  afterAll(async () => {
    await deleteData();
  });

  describe("プロフィール編集, PATCH /users", () => {
    const url = `${baseUrl}/users`;

    test("payloadに渡したデータに更新される", async () => {
      const user = await prisma.user.create({
        data: {
          name: "大谷さん",
          lineId: "lineid",
          accessToken: "accessToken",
        },
      });

      const dataForUpdate: UpdateUserPayload = {
        name: "新大谷さん",
        avatar: "newAvatarUrl",
        introduce: "intro",
        avatarExt: "png",
        backGroundItem: "bgItem",
        backGroundItemType: "video",
        statusMessage: "m",
        deleteAvatar: false,
        deleteBackGroundItem: false,
        backGroundItemExt: "png",
        instagram: null,
        twitter: null,
        youtube: "youtube",
        tiktok: "toktok",
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

      const newUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      const { name, avatar, backGroundItem } = JSON.parse(res.payload);
      const resResult = { name, avatar, backGroundItem };
      expect(resResult).toEqual({
        name: "新大谷さん",
        avatar: mockedImageUrl,
        backGroundItem: mockedImageUrl,
      });
      expect(newUser?.name).toEqual("新大谷さん");
    });

    test("認可情報がない場合、401エラーを返す", async () => {
      await prisma.user.create({
        data: {
          name: "name",
          lineId: "lineID",
          accessToken: hashedAccessToken,
        },
      });

      const res = await server.inject({
        method: "PATCH",
        url,
      });

      expect(res.statusCode).toEqual(401);
    });

    test("認可情報が間違っている場合、401エラーを返す", async () => {
      await prisma.user.create({
        data: {
          name: "name",
          lineId: "lienId",
          accessToken: hashedAccessToken,
        },
      });

      const res = await server.inject({
        method: "PATCH",
        url: `${url}?id=ijijijiji`,
        headers: { Authorization: "Bearer WrongBearer" },
      });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe("位置情報更新, PATCH /users/locaiton", () => {
    const url = `${baseUrl}/users/location`;
    let spy: jest.SpyInstance;

    afterEach(() => {
      if (spy) {
        spy.mockRestore();
      }
    });

    test("認可情報がない場合401エラーを返す", async () => {
      const res = await server.inject({
        method: "PATCH",
        url,
      });

      expect(res.statusCode).toEqual(401);
    });

    test("認可情報が間違っている場合401エラーを返す", async () => {
      const user = await prisma.user.create({
        data: {
          name: "user",
          lineId: "lineId",
          accessToken: "accessToken",
        },
      });

      const res = await server.inject({
        method: "PATCH",
        url: `${url}?id=${user.id}`,
        headers: { Authorization: "Bearer WrongBearer" },
      });

      expect(res.statusCode).toEqual(401);
    });

    test("リクエストユーザーの位置情報が更新される", async () => {
      const cryptoLat = "lat";
      const cryptoLng = "lng";
      const cryptoModules = require("~/helpers/crypto");
      spy = jest
        .spyOn(cryptoModules, "handleUserLocationCrypto")
        .mockReturnValue({
          lat: cryptoLat,
          lng: cryptoLng,
        });

      const user = await prisma.user.create({
        data: {
          name: "shohei",
          lineId: "lineId",
          accessToken: "token",
        },
      });

      await server.inject({
        method: "PATCH",
        url,
        payload: {
          lat: 10,
          lng: 10,
        },
        auth: {
          strategy: "simple",
          credentials: {},
          artifacts: user,
        },
      });

      const updatedUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      expect(updatedUser?.lat).toEqual(cryptoLat);
      expect(updatedUser?.lng).toEqual(cryptoLng);
    });

    // important
    test("プライベートゾーンに入った場合はinPrivateZoneが更新される", async () => {
      const cryptoLat = "lat";
      const cryptoLng = "lng";
      const module = require("@turf/distance");
      spy = jest.spyOn(module, "default").mockReturnValue(0.1);

      const user = await prisma.user.create({
        data: {
          name: "name",
          lineId: "lineId",
          accessToken: "accessToken",
        },
      });

      await prisma.privateZone.create({
        data: {
          lat: cryptoLat,
          lng: cryptoLng,
          address: "address",
          userId: user.id,
        },
      });

      await server.inject({
        method: "PATCH",
        url,
        payload: {
          lat: 10,
          lng: 10,
        },
        auth: {
          strategy: "simple",
          credentials: {},
          artifacts: user,
        },
      });

      const updatedUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      expect(updatedUser?.inPrivateZone).toBeTruthy();
    });
  });

  describe.only("ユーザーページデータ取得, GET /users/{userId}/page_info", () => {
    const url = ({
      targetUserId,
      requestUserId,
    }: {
      targetUserId: string;
      requestUserId: string;
    }) => `${baseUrl}/users/${targetUserId}/page_info?id=${requestUserId}`;

    test("認可情報がない場合、401エラーを返す", async () => {
      const res = await server.inject({
        method: "GET",
        url: url({ requestUserId: "1", targetUserId: "11" }),
      });

      expect(res.statusCode).toEqual(401);
    });

    test("認可情報が間違っている場合、401エラーを返す", async () => {
      const user = await prisma.user.create({
        data: {
          name: "name",
          lineId: "lineId",
          accessToken: "accessToken",
        },
      });

      const res = await server.inject({
        method: "GET",
        url: url({ targetUserId: "111", requestUserId: user.id }),
        headers: { Authorization: "Bearer WrongBearer" },
      });

      expect(res.statusCode).toEqual(401);
    });

    test("指定したユーザーのデータを返す", async () => {
      const requestUser = await prisma.user.create({
        data: {
          name: "name",
          lineId: "lineId1",
          accessToken: "token1",
        },
      });

      const targetUser = await prisma.user.create({
        data: {
          name: "suis",
          lineId: "lineId2",
          accessToken: "token2",
        },
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

      expect(JSON.parse(res.payload).id).toEqual(targetUser.id);
      expect(JSON.parse(res.payload).name).toEqual(targetUser.name);
    });

    test("リクエストユーザーが対象のユーザーをブロックしている場合、PostやFlashは空が返される", async () => {
      const requestUser = await prisma.user.create({
        data: {
          name: "nammee",
          lineId: "1",
          accessToken: "1",
        },
      });

      const targetUser = await prisma.user.create({
        data: {
          name: "namememe",
          lineId: "2",
          accessToken: "2",
        },
      });

      await prisma.post.create({
        data: {
          userId: targetUser.id,
          url: "url",
        },
      });

      await prisma.flash.create({
        data: {
          userId: targetUser.id,
          source: "ソース",
          sourceType: "image",
        },
      });

      await prisma.block.create({
        data: {
          blockBy: requestUser.id,
          blockTo: targetUser.id,
        },
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

      expect(JSON.parse(res.payload).posts.length).toEqual(0);
      expect(JSON.parse(res.payload).flashes.length).toEqual(0);
    });

    test("リクエストユーザーが対象のユーザーにブロックされている場合、PostやFlashは空が返される", async () => {});
  });
});
