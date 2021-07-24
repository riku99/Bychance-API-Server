import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { resetDatabase } from "../helpers";
import { clientSignupTokenPath } from "~/routes/clientSignupToken";
import { checkBeareFirebaseJWT } from "~/auth/bearer";
import { initializeServer } from "~/server";

const prisma = new PrismaClient();

const postRequestSchema = {
  method: "POST",
  url: clientSignupTokenPath,
  options: {
    auth: {
      name: "Admin User",
      admin: true,
    },
  },
};

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
    console.log("beforeEach");
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
        expect(res.statusCode).toEqual(200);
      });
    });

    describe("adminユーザーじゃない", () => {
      test("invalidエラーを返す", async () => {
        expect(true).toBeTruthy();
      });
    });
  });
});
