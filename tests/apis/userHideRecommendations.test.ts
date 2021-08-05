import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { resetDatabase } from "../helpers";
import { userHideRecommendationsPath } from "~/routes/userHideRecommendations";
import {
  createRecommenadtionClient,
  recommendationClient,
} from "../data/recommendationClient";
import {
  createRecommendation,
  displayedRecommendation,
} from "../data/recommendation";
import { createUser } from "../data/user";

const prisma = new PrismaClient();

describe("userHideRecommendations", () => {
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
    test("非表示データに登録され、200を返す", async () => {
      await createRecommenadtionClient();
      await createRecommendation();
      const user = await createUser();

      const targetId = displayedRecommendation.id;

      const res = await server.inject({
        method: "POST",
        url: `${userHideRecommendationsPath}/${targetId}`,
        auth: {
          strategy: "simple",
          artifacts: {
            id: user.id,
          },
          credentials: {},
        },
      });

      const result = await prisma.userHideRecommendation.findFirst();

      expect(res.statusCode).toEqual(200);
      expect(result?.recommendationId).toEqual(targetId);
    });
  });
});
