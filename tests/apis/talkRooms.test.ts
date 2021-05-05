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

describe("talkRooms", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
  });

  describe("POST /talkRooms", () => {
    const successfulRequestSchema = {
      method: "POST",
      url: `${baseUrl}/talkRooms?id=${user.id}`,
      payload: { partnerId: "2" },
      headers: { Authorization: `Bearer ${accessToken}` },
    };

    describe("バリデーションに通る", () => {});

    describe("バリデーションに引っかかる", () => {
      afterEach(async () => {
        await prisma.user.deleteMany({});
      });

      test("必要なデータが存在しないので400を返す", async () => {
        await prisma.user.create({ data: user });

        const res = await server.inject({
          ...successfulRequestSchema,
          payload: {}, // payloadが空
        });

        expect(res.statusCode).toEqual(400);
      });

      test("余計なデータが存在するので400を返す", async () => {
        await prisma.user.create({ data: user });

        const res = await server.inject({
          ...successfulRequestSchema,
          payload: { accessToken: "11112222" }, // payloadにいらないデータ(accessToken)がある
        });

        expect(res.statusCode).toEqual(400);
      });
    });
  });
});
