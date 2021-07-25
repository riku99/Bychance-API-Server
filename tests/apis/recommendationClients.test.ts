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
    describe("firebaseでトークンが認証される", () => {
      test("ユーザーが作成され、idとnameを返す", async () => {
        // verifyIdTokenのモック
        const admin = require("firebase-admin");
        const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: "uid" });
        const mockAuth = jest
          .fn()
          .mockReturnValue({ verifyIdToken: mockVerifyIdToken });
        const spy = jest
          .spyOn(admin, "app")
          .mockReturnValue({ auth: mockAuth });

        const req = await server.inject({
          method: "POST",
          url: recommendationClientsPath,
          payload: {
            name: "User",
          },
          headers: {
            authorization: "Bearer Token",
          },
        });

        console.log(spy.mock.results[0]);
        console.log(mockVerifyIdToken.mock.results[0]);
      });
    });

    describe("firebaseでトークンの認証に失敗する", () => {});
  });
});
