import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import admin from "firebase-admin";

import { initializeServer } from "~/server";
import { resetDatabase } from "../helpers";
import { recommendationClientsPath } from "~/routes/recommendationClients";

const prisma = new PrismaClient();

describe("recommendationClients", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
    jest.setTimeout(50000);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await server.stop();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  describe("POST path", () => {
    let spy: jest.SpyInstance;

    afterEach(() => {
      spy.mockRestore();
    });

    describe("firebaseでトークンが認証される", () => {
      test("クライアントが作成され、idとnameを返す", async () => {
        const admin = require("firebase-admin");
        const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: "uid" });
        const mockAuth = jest
          .fn()
          .mockReturnValue({ verifyIdToken: mockVerifyIdToken });
        spy = jest.spyOn(admin, "app").mockReturnValue({ auth: mockAuth });

        const res = await server.inject({
          method: "POST",
          url: recommendationClientsPath,
          payload: {
            name: "イタチ",
          },
          headers: {
            authorization: "Bearer Token",
          },
        });

        const client = await prisma.recommendationClient.findFirst();

        expect(client?.uid).toEqual("uid");
        expect(res.payload).toEqual(
          JSON.stringify({
            id: client?.id,
            name: client?.name,
          })
        );
      });
    });

    describe("firebaseでトークンの認証に失敗する", () => {
      test("401エラーが返されてクライアントは作成されない", async () => {
        const admin = require("firebase-admin");
        const mockVerifyIdToken = jest.fn().mockRejectedValue(undefined); // 失敗させる
        const mockAuth = jest
          .fn()
          .mockReturnValue({ verifyIdToken: mockVerifyIdToken });
        spy = jest.spyOn(admin, "app").mockReturnValue({ auth: mockAuth });

        const res = await server.inject({
          method: "POST",
          url: recommendationClientsPath,
          payload: {
            name: "イタチ",
          },
          headers: {
            authorization: "Bearer Token",
          },
        });

        // 作成されていないことを保証
        const client = await prisma.recommendationClient.findFirst();

        expect(res.statusCode).toEqual(401);
        expect(client).toBeNull();
      });
    });
  });
});
