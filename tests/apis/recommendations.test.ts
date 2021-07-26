import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { resetDatabase } from "../helpers";
import { recommendationsPath } from "~/routes/recommendations";
import {
  createRecommendation,
  displayedRecommendation,
  expiredRecommendation,
  notDisplayedRecommendation,
} from "../data/recommendation";
import {
  createRecommenadtionClient,
  recommendationClient,
} from "../data/recommendationClient";

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
      await createRecommendation();
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
});