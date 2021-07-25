import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { resetDatabase } from "../helpers";
import { clientSignupTokenPath } from "~/routes/clientSignupToken";
import { initializeServer } from "~/server";

const prisma = new PrismaClient();

describe("clientSignupToken", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
    jest.setTimeout(10000);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await server.stop();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  describe("POST clientSignupTokenPath", () => {
    describe("adminユーザー", () => {
      test("トークンを作成してそのトークンを返す", async () => {
        const res = await server.inject({
          method: "POST",
          url: clientSignupTokenPath,
          auth: {
            strategy: "r-client",
            credentials: {},
            artifacts: {
              name: "Admin User",
              admin: true,
            },
          },
        });

        // 返されたトークンが作成されている
        const token = await prisma.clientSignupToken.findUnique({
          where: {
            token: res.payload,
          },
        });
        expect(res.statusCode).toEqual(200);
        expect(token).toBeTruthy();
      });
    });

    describe("adminユーザーじゃない", () => {
      test("invalidエラーを返す", async () => {
        const res = await server.inject({
          method: "POST",
          url: clientSignupTokenPath,
          auth: {
            strategy: "r-client",
            credentials: {},
            artifacts: {
              admin: false,
            },
          },
        });

        // トークンが作成されていないことを保証
        const token = await prisma.clientSignupToken.findFirst();

        expect(res.statusCode).toEqual(400);
        expect(token).toBeNull();
      });
    });
  });
});
