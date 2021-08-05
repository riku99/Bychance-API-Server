import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import geohash from "ngeohash";

import { initializeServer } from "~/server";
import { resetDatabase } from "../helpers";
import { recommendationsPath } from "~/routes/recommendations";
import {
  createRecommendations,
  displayedRecommendation,
} from "../data/recommendation";
import {
  createRecommenadtionClient,
  recommendationClient,
} from "../data/recommendationClient";
import { createUser, User } from "../data/user";
import { createHash } from "~/helpers/crypto";

const prisma = new PrismaClient();

describe("recommendations", () => {
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

  describe("GET path/client", () => {
    beforeEach(async () => {
      await createRecommenadtionClient();
      await createRecommendations();
    });

    describe("?type=nowを指定", () => {
      test("現在表示中のデータのみ返す", async () => {
        const res = await server.inject({
          method: "GET",
          url: `${recommendationsPath}/client?type=now`, // typeフラグをnowに指定
          auth: {
            strategy: "r-client",
            artifacts: recommendationClient,
            credentials: {},
          },
        });

        const _res = JSON.parse(res.payload) as any[];

        expect(_res.length).toEqual(1);
        expect(_res[0].id).toEqual(displayedRecommendation.id);
      });
    });

    describe("クエリにtypeを指定しない", () => {
      test("既に非表示のデータを返す", async () => {
        const res = await server.inject({
          method: "GET",
          url: `${recommendationsPath}/client`, // typeフラグを指定しない
          auth: {
            strategy: "r-client",
            artifacts: recommendationClient,
            credentials: {},
          },
        });

        const _res = JSON.parse(res.payload) as any[];

        expect(_res.length).toEqual(2);
      });
    });
  });

  describe("GET path/hide", () => {
    test("指定したデータが非表示になる", async () => {
      await prisma.recommendationClient.create({
        data: recommendationClient,
      });

      await prisma.recommendation.create({
        data: displayedRecommendation,
      });

      const _rc = await prisma.recommendation.findFirst();
      expect(_rc?.display).toBeTruthy();

      const res = await server.inject({
        method: "GET",
        url: `${recommendationsPath}/hide/${displayedRecommendation.id}`,
        auth: {
          strategy: "r-client",
          artifacts: recommendationClient,
          credentials: {},
        },
      });

      const rc = await prisma.recommendation.findFirst();
      expect(rc?.display).toBeFalsy();
      expect(res.statusCode).toEqual(200);
    });
  });

  describe("GET path", () => {
    let spy: jest.SpyInstance;
    let spy2: jest.SpyInstance;

    afterEach(() => {
      spy.mockRestore();
      spy2.mockRestore();
    });

    test("200と適切なデータを返す", async () => {
      const commonGeohash = "geohash"; // クライアントのgeohashとuserのgeohash7を共通にする

      await prisma.recommendationClient.create({
        data: {
          ...recommendationClient,
          geohash: createHash(commonGeohash), // ハッシュ化して保存
        },
      });
      await createRecommendations();
      const user = await prisma.user.create({
        data: {
          ...User,
          geohash7: createHash(commonGeohash), // ハッシュ化して保存
        },
      });

      const geohash = require("ngeohash");
      spy = jest.spyOn(geohash, "encode").mockReturnValue(commonGeohash);
      spy2 = jest.spyOn(geohash, "neighbors").mockReturnValue(["ggg", "hhhh"]);

      const res = await server.inject({
        method: "GET",
        url: `${recommendationsPath}?id=${user.id}&lat=${1}&lng=${1}`,
        auth: {
          strategy: "simple",
          artifacts: user,
          credentials: {},
        },
      });

      expect(res.statusCode).toEqual(200);
      expect(JSON.parse(res.payload)[0].id).toEqual(displayedRecommendation.id);
    });

    describe("クライアントのアカウントが削除されている", () => {
      test("そのデータは返されないで200を返す", async () => {
        const commonGeohash = "geohash"; // クライアントのgeohashとuserのgeohash7を共通にする

        // geohash周りのモック
        const geohash = require("ngeohash");
        spy = jest.spyOn(geohash, "encode").mockReturnValue(commonGeohash);
        spy2 = jest
          .spyOn(geohash, "neighbors")
          .mockReturnValue(["ggg", "hhhh"]);

        await prisma.recommendationClient.create({
          data: {
            ...recommendationClient,
            deleted: true, // アカウント削除状態にする
            geohash: createHash(commonGeohash), // geohashは同じデータにする
          },
        });
        await createRecommendations();
        const user = await prisma.user.create({
          data: {
            ...User,
            geohash7: createHash(commonGeohash),
          },
        });

        const res = await server.inject({
          method: "GET",
          url: `${recommendationsPath}?id=${user.id}&lat=${1}&lng=${1}`,
          auth: {
            strategy: "simple",
            artifacts: user,
            credentials: {},
          },
        });

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload).length).toEqual(0);
      });
    });

    describe("ユーザーがデータを非表示にしている", () => {
      test("そのデータは返されないで200を返す", async () => {
        const commonGeohash = "geohash"; // クライアントのgeohashとuserのgeohash7を共通にする

        // geohash周りのモック
        const geohash = require("ngeohash");
        spy = jest.spyOn(geohash, "encode").mockReturnValue(commonGeohash);
        spy2 = jest
          .spyOn(geohash, "neighbors")
          .mockReturnValue(["ggg", "hhhh"]);

        await prisma.recommendationClient.create({
          data: {
            ...recommendationClient,
            geohash: createHash(commonGeohash),
          },
        });
        const recommendations = await createRecommendations();
        const user = await prisma.user.create({
          data: {
            ...User,
            geohash7: createHash(commonGeohash),
          },
        });
        // ユーザーが非表示にした
        await prisma.userHideRecommendation.create({
          data: {
            userId: user.id,
            recommendationId: recommendations["displayed"].id,
          },
        });

        const res = await server.inject({
          method: "GET",
          url: `${recommendationsPath}?id=${user.id}&lat=${1}&lng=${1}`,
          auth: {
            strategy: "simple",
            artifacts: user,
            credentials: {},
          },
        });

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload).length).toEqual(0);
      });
    });

    describe("geohashが該当しない", () => {
      test("そのデータは返されずに200を返す", async () => {
        await prisma.recommendationClient.create({
          data: {
            ...recommendationClient,
            geohash: "rrrrr", // geohashをUserと別にする
          },
        });
        await createRecommendations();
        const user = await prisma.user.create({
          data: {
            ...User,
            geohash7: "uuuuu", // geohashをClentRecommendationと別にする
          },
        });

        const res = await server.inject({
          method: "GET",
          url: `${recommendationsPath}?id=${user.id}&lat=${1}&lng=${1}`,
          auth: {
            strategy: "simple",
            artifacts: user,
            credentials: {},
          },
        });

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload).length).toEqual(0);
      });
    });
  });
});
