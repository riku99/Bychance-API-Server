import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { resetDatabase } from "../helpers";
import { recommendationClientsPath } from "~/routes/recommendationClients";
import { recommendationClient } from "../data/recommendationClient";
import { createRecommendation } from "../data/recommendation";

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

  // アカウント削除機能
  describe("DELETE path", () => {
    test("個人情報に当たるだろうカラムがnullまたは空文字になり、deletedはtrue、関連する投稿は全てdisplayがfalseになる", async () => {
      const c = await prisma.recommendationClient.create({
        data: recommendationClient,
      });

      expect(c.name).toEqual(recommendationClient.name);
      // expect(c.uid).toEqual(recommendationClient.uid);
      expect(c.image).toEqual(recommendationClient.image);
      expect(c.address).toEqual(recommendationClient.address);
      expect(c.instagram).toEqual(recommendationClient.instagram);
      expect(c.twitter).toEqual(recommendationClient.twitter);
      expect(c.url).toEqual(recommendationClient.url);
      expect(c.deleted).toBeFalsy();
      expect(c.lat).toEqual(recommendationClient.lat);
      expect(c.lng).toEqual(recommendationClient.lng);
      expect(c.geohash).toEqual(recommendationClient.geohash);

      const _recommendation = await createRecommendation();
      expect(_recommendation["displayed"].display).toBeTruthy();
      expect(_recommendation["expired"].display).toBeTruthy();

      const res = await server.inject({
        method: "DELETE",
        url: recommendationClientsPath,
        auth: {
          strategy: "r-client",
          credentials: {},
          artifacts: c,
        },
      });

      const deletedClient = await prisma.recommendationClient.findUnique({
        where: {
          id: recommendationClient.id,
        },
      });

      expect(res.statusCode).toEqual(200);
      expect(deletedClient?.name).toEqual("");
      // expect(deletedClient?.uid).toEqual(""); // uidはそのまま
      expect(deletedClient?.image).toBeNull();
      expect(deletedClient?.address).toBeNull();
      expect(deletedClient?.instagram).toBeNull();
      expect(deletedClient?.twitter).toBeNull();
      expect(deletedClient?.deleted).toBeTruthy();
      expect(deletedClient?.lat).toBeNull();
      expect(deletedClient?.lng).toBeNull();
      expect(deletedClient?.geohash).toBeNull();

      const relatedRecommendations = await prisma.recommendation.findMany({
        where: {
          clientId: recommendationClient.id,
        },
      });

      relatedRecommendations.forEach((d) => {
        expect(d.display).toBeFalsy();
      });
    });
  });
});
