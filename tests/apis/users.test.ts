import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import distance from "@turf/distance";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createHash } from "~/helpers/crypto";
import { createS3ObjectPath } from "~/helpers/aws";
import { UpdateUserPayload } from "~/routes/users/validator";
import { handleUserLocationCrypto } from "~/helpers/crypto";

const prisma = new PrismaClient();

const accessToken = "accessToken";
const hashedAccessToken = createHash(accessToken);

const mockedImageUrl = "imageUrl";
jest.mock("~/helpers/aws");
(createS3ObjectPath as any).mockResolvedValue({
  source: mockedImageUrl,
});

describe("users", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
    await prisma.user.deleteMany({});
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
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
});
