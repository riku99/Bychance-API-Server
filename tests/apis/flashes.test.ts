import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants/url";
import { createHash } from "~/helpers/crypto";
import { invalidErrorType } from "~/config/apis/errors";
import { createS3ObjectPath } from "~/helpers/aws";
import { serializeFlash } from "~/serializers/flash";

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

const createS3ObjectPathResult = "image url";
jest.mock("~/helpers/aws");
(createS3ObjectPath as any).mockResolvedValue(createS3ObjectPathResult);

const serializeResult = {
  id: 1,
  source: createS3ObjectPathResult,
  sourceType: "image",
};
jest.mock("~/serializers/flash");
(serializeFlash as any).mockResolvedValue(serializeResult);

describe("flashes", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
  });

  beforeEach(async () => {
    await prisma.flash.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.user.create({ data: user });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
  });

  describe("POST /flashes", () => {
    const successfulRequestSchema = {
      method: "POST",
      url: `${baseUrl}/flashes?id=${user.id}`,
      payload: { source: "source", sourceType: "image", ext: null },
      headers: { Authorization: `Bearer ${accessToken}` },
    };

    describe("バリデーションに通る", () => {
      test("200とシリアライズされた結果を返す", async () => {
        const res = await server.inject(successfulRequestSchema);

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload)).toEqual(serializeResult);
      });
    });

    describe("バリデーションに引っかかる", () => {
      test("payloadに必要なデータがないので400を返す", async () => {
        const req = await server.inject({
          ...successfulRequestSchema,
          payload: { sourceType: "image", ext: null }, // sourceなし
        });

        expect(req.statusCode).toEqual(400);
        expect(JSON.parse(req.payload).errorType).toEqual(invalidErrorType);
      });

      test("payloadに余計なデータがあるので400を返す", async () => {
        const req = await server.inject({
          ...successfulRequestSchema,
          payload: { ...successfulRequestSchema.payload, accessToken: "wwwww" }, // accessTokenの追加
        });

        expect(req.statusCode).toEqual(400);
        expect(JSON.parse(req.payload).errorType).toEqual(invalidErrorType);
      });

      test("sourceTypeが指定されたもの以外のデータなので400を返す", async () => {
        const req = await server.inject({
          ...successfulRequestSchema,
          payload: { ...successfulRequestSchema.payload, sourceType: "buffer" }, // sourceTypeの変更
        });

        expect(req.statusCode).toEqual(400);
        expect(JSON.parse(req.payload).errorType).toEqual(invalidErrorType);
      });
    });
  });

  describe("DELETE /flashes/{flashId}", () => {
    const successfulRequestSchema = {
      method: "DELETE",
      url: `${baseUrl}/flashes/1?id=${user.id}`,
      headers: { Authorization: `Bearer ${accessToken}` },
    };

    describe("バリデーションに通る", () => {
      describe("保存されているflashのuserIdと送られてきたidが一致", () => {
        test("200を返す", async () => {
          await prisma.flash.create({
            data: flash,
          });

          const res = await server.inject(successfulRequestSchema);

          expect(res.statusCode).toEqual(200);
        });
      });

      describe("一致しない", () => {
        test("400を返す", async () => {
          await prisma.user.deleteMany({});
          await prisma.user.create({
            data: user,
          });

          // flashを作成するためのuserを作成
          await prisma.user.create({
            data: {
              ...user,
              id: "2",
              lineId: "line2",
              accessToken: "token2",
            },
          });

          await prisma.flash.create({
            data: {
              ...flash,
              userId: "2", // リクエストするuserIdとは違う値を指定
            },
          });

          const res = await server.inject(successfulRequestSchema);

          expect(res.statusCode).toEqual(400);
          expect(JSON.parse(res.payload).errorType).toEqual(invalidErrorType);
        });
      });
    });

    // paramsなので指定しないとバリデーションエラーより先に404返される
    // describe("バリデーションに引っかかる", () => {
    //   test("paramsに必要なデータがないので400を返す", async () => {
    //     const res = await server.inject({
    //       ...successfulRequestSchema,
    //       url: `${baseUrl}/flashes`,
    //     });

    //     expect(res.statusCode).toEqual(400);
    //     expect(JSON.parse(res.payload).errorType).toEqual(invalidErrorType);
    //   });
    //});
  });
});
