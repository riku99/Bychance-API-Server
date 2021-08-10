import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { resetDatabase } from "../helpers";
import { recommendationClientNotificationsPath } from "~/routes/recommendationClientNotification";
import { createRecommendationClientNotifications } from "../data/recommendationClientNotifications";

const prisma = new PrismaClient();

describe("recommendationClientNotifications", () => {
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

  describe("GET path", () => {
    test("createdAtを基準に降順で返される", async () => {
      await createRecommendationClientNotifications();

      const res = await server.inject({
        method: "GET",
        url: recommendationClientNotificationsPath,
        auth: {
          strategy: "r-client",
          credentials: {},
          artifacts: {},
        },
      });

      const result = JSON.parse(res.payload);
      expect(result.length).toEqual(3);
      expect(result[0].createdAt > result[1].createdAt).toBeTruthy(); // 降順
      expect(result[1].createdAt > result[2].createdAt).toBeTruthy(); // 降順
    });
  });

  describe("GET path/{id}", () => {
    test("指定したidのデータを返す", async () => {
      const data = await createRecommendationClientNotifications();
      const data1 = data[0];

      const res = await server.inject({
        method: "GET",
        url: `${recommendationClientNotificationsPath}/${data1.id}`,
        auth: {
          strategy: "r-client",
          credentials: {},
          artifacts: {},
        },
      });

      expect(res.statusCode).toEqual(200);
      expect(JSON.parse(res.payload).text).toEqual(data1.text);
    });
  });
});
