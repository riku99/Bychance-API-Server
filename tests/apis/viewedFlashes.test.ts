import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants/url";
import { createHash } from "~/helpers/crypto";
import { invalidErrorType } from "~/config/apis/errors";

const prisma = new PrismaClient();

const accessToken = "生accessToken";
const hashedAccessToken = createHash(accessToken);

const user = {
  id: "1",
  lineId: "lineId",
  accessToken: hashedAccessToken,
  name: "name",
};

const flash = {
  id: 1,
  source: "url",
  sourceType: "image" as const,
  userId: "1",
};

describe("viewedFlashes", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
  });

  afterAll(async () => {
    await prisma.flash.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe("POST /viewedFlashes", () => {
    const successfulRequestSchema = {
      method: "POST",
      url: `${baseUrl}/viewedFlashes?id=${user.id}`,
      payload: { flashId: 1 },
      headers: { Authorization: `Bearer ${accessToken}` },
    };

    describe("バリデーションに通る", () => {
      describe("送信されたデータが新規のものである(ユニークである)", () => {
        test("作成し200を返す", async () => {
          await prisma.user.create({ data: user });
          await prisma.flash.create({ data: flash });

          const res = await server.inject(successfulRequestSchema);

          expect(res.statusCode).toEqual(200);

          const data = await prisma.viewedFlash.findUnique({
            where: {
              userId_flashId_unique: {
                userId: user.id,
                flashId: flash.id,
              },
            },
          });

          // データが作成されたかを検証
          expect(data).toBeTruthy();
        });
      });

      describe("既に存在しているデータである", () => {
        test("作成はされずに200を返す", async () => {
          await prisma.viewedFlash.deleteMany({});
          await prisma.flash.deleteMany({});
          await prisma.user.deleteMany({});
          await prisma.user.create({ data: user });
          await prisma.flash.create({ data: flash });

          // 前もってデータを作成
          await prisma.viewedFlash.create({
            data: {
              userId: user.id,
              flashId: flash.id,
            },
          });

          const res = await server.inject(successfulRequestSchema);

          expect(res.statusCode).toEqual(200);

          const data = await prisma.viewedFlash.findMany({});

          expect(data.length).toEqual(1);
        });
      });
    });

    describe("バリデーションに引っかかる", () => {
      test("payloadに必要なデータがないので400を返す", async () => {
        const res = await server.inject({
          ...successfulRequestSchema,
          payload: {},
        });

        expect(res.statusCode).toEqual(400);
        expect(JSON.parse(res.payload).errorType).toEqual(invalidErrorType);
      });
    });

    test("payloadに余計なデータがあるので400を返す", async () => {
      const res = await server.inject({
        ...successfulRequestSchema,
        payload: { flashId: 1, lineId: "111222" },
      });

      expect(res.statusCode).toEqual(400);
      expect(JSON.parse(res.payload).errorType).toEqual(invalidErrorType);
    });
  });
});
