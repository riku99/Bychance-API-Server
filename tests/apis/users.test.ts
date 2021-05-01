import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants/url";
import { UpdateUserPayload } from "~/routes/users/validator";
import { createHash, handleUserLocationCrypt } from "~/helpers/crypto";
import { createS3ObjectPath } from "~/helpers/aws";
import { serializeUser } from "~/serializers/users";

const prisma = new PrismaClient();

const accessToken = "生accessToken";
const hashedAccessToken = createHash(accessToken);

jest.mock("~/helpers/aws");
(createS3ObjectPath as any).mockResolvedValue("image url");

const user = {
  id: "1",
  lineId: "lineId",
  accessToken: hashedAccessToken,
  name: "name",
};

const updatePayload: UpdateUserPayload = {
  name: "パワー",
  introduce: "ワシが最強じゃ",
  statusMessage: "血をくれ",
  avatar: "url",
  deleteImage: false,
};

describe("users", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
  });

  describe("POST /users", () => {
    beforeEach(async () => {
      await prisma.user.deleteMany({});
    });

    test("200返す", async () => {
      await prisma.user.create({ data: user });

      const res = await server.inject({
        method: "PATCH",
        url: `${baseUrl}/users?id=${user.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: updatePayload,
      });

      expect(res.statusCode).toEqual(200);
      expect(JSON.parse(res.payload).name).toEqual(updatePayload.name);
      expect(JSON.parse(res.payload).introduce).toEqual(
        updatePayload.introduce
      );
      expect(JSON.parse(res.payload).statusMessage).toEqual(
        updatePayload.statusMessage
      );
      expect(JSON.parse(res.payload).avatar).toEqual("image url"); // creates3Objectが返した結果
    });

    test("avatarはなくてokだし、introduce、statusMessageは空文字でok", async () => {
      await prisma.user.deleteMany({});
      await prisma.user.create({ data: user });

      const res = await server.inject({
        method: "PATCH",
        url: `${baseUrl}/users?id=${user.id}`,
        // avatarなし
        payload: {
          name: "riku",
          introduce: "", // 空文字
          statusMessage: "", // から文字
          deleteImage: false,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      expect(res.statusCode).toEqual(200);
    });

    test("payloadにnameがないと400エラーを返す", async () => {
      await prisma.user.create({ data: user });

      const { name, ...rest } = updatePayload; // nameとる
      const res = await server.inject({
        method: "PATCH",
        url: `${baseUrl}/users?id=${user.id}`,
        payload: rest,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      expect(res.statusCode).toEqual(400);
    });

    test("許可されていないフィールドがあると400エラーを返す", async () => {
      await prisma.user.create({ data: user });

      const res = await server.inject({
        method: "PATCH",
        url: `${baseUrl}/users?id=${user.id}`,
        payload: { ...updatePayload, accessToken: "12345" }, // 許可されていないaccessTokenの追加
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      expect(res.statusCode).toEqual(400);
    });

    describe("PATCH /users/refresh", () => {
      describe("バリデーションが通る", () => {
        describe("自分のデータに対して更新をかける", () => {
          test("200とuserを返す", async () => {
            const _user = await prisma.user.create({
              data: user,
            });

            const res = await server.inject({
              method: "PATCH",
              url: `${baseUrl}/users/refresh?id=${user.id}`,
              payload: { userId: "1" },
              headers: { Authorization: `Bearer ${accessToken}` },
            });

            const expectedData = {
              isMyData: true,
              data: serializeUser({ user: _user }),
            };

            expect(res.statusCode).toEqual(200);
            expect(JSON.parse(res.payload)).toEqual(expectedData);
          });
        });

        describe("バリデーション失敗する", () => {
          test("payloadにuserIdがないので400エラー", async () => {
            await prisma.user.create({
              data: user,
            });
            // payloadなし
            const res = await server.inject({
              method: "PATCH",
              url: `${baseUrl}/users/refresh?id=${user.id}`,
              headers: { Authorization: `Bearer ${accessToken}` },
            });

            expect(res.statusCode).toEqual(400);
          });

          test("payloadに不必要なデータが含まれている場合400エラー", async () => {
            await prisma.user.create({
              data: user,
            });

            const res = await server.inject({
              method: "PATCH",
              url: `${baseUrl}/users/refresh?id=${user.id}`,
              payload: { userId: "1", accessToken: "1234" }, // いらないデータの追加
              headers: { Authorization: `Bearer ${accessToken}` },
            });

            expect(res.statusCode).toEqual(400);
          });
        });
      });
    });

    describe("PATCH /users/location", () => {
      beforeEach(async () => {
        await prisma.user.deleteMany({});
      });

      describe("バリデーションに通る", () => {
        test("200を返す", async () => {
          await prisma.user.deleteMany({});
          await prisma.user.create({
            data: user,
          });

          const res = await server.inject({
            method: "PATCH",
            url: `${baseUrl}/users/location?id=${user.id}`,
            payload: { lat: 10, lng: 15 },
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          expect(res.statusCode).toEqual(200);
        });
      });

      describe("バリデーションに引っかかる", () => {
        test("payloadに必要なデータがないため400エラーを返す", async () => {
          await prisma.user.create({
            data: user,
          });

          const res = await server.inject({
            method: "PATCH",
            url: `${baseUrl}/users/location?id=${user.id}`,
            payload: {}, // payloadに何も入れない
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          expect(res.statusCode).toEqual(400);
        });
      });
    });
  });
});
