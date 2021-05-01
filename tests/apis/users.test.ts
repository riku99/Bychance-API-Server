import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants/url";
import { UpdateUserPayload } from "~/routes/users/validator";
import { createHash } from "~/helpers/crypto";

const prisma = new PrismaClient();

const accessToken = "生accessToken";
const hashedAccessToken = createHash(accessToken);

const user = {
  id: "user-id",
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

  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
  });

  describe("POST /users", () => {
    test("payloadにnameがないと400エラーを返す", async () => {
      await prisma.user.create({ data: user });

      const { name, ...rest } = updatePayload;
      const res = await server.inject({
        method: "POST",
        url: `${baseUrl}/users?id=${user.id}`,
        payload: rest,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log(res.payload);
      expect(res.statusCode).toEqual(400);
    });

    test("許可されていないフィールドがあると400エラーを返す", async () => {
      await prisma.user.create({ data: user });

      const res = await server.inject({
        method: "POST",
        url: `${baseUrl}/users?id=${user.id}`,
        payload: { ...updatePayload, accessToken: "12345" }, // 許可されていないaccessTokenの追加
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log(res.payload);
      expect(res.statusCode).toEqual(400);
    });

    test("avatarはなくてokだし、introduce、statusMessageは空文字でok", async () => {
      await prisma.user.deleteMany({});
      await prisma.user.create({ data: user });

      const res = await server.inject({
        method: "POST",
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

      console.log(res.payload);
      expect(res.statusCode).toEqual(200);
    });
  });
});
