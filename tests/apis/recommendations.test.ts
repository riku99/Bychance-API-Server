import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { resetDatabase } from "../helpers";
import { recommendationsPath } from "~/routes/recommendations";
import { createRecommendation } from "../data/recommendation";
import { createRecommenadtionClient } from "../data/recommendationClient";

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
        const result = await prisma.recommendation.findMany();
        console.log(result);
      });
    });

    describe("既に非表示になっているデータを取得する", () => {});
  });
});
