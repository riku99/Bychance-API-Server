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

  describe("DELETE /flashes/{flashId}", () => {});
});
