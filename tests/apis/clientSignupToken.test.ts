import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import { subHours } from "date-fns";

import { resetDatabase } from "../helpers";
import { clientSignupTokenPath } from "~/routes/clientSignupToken";
import { initializeServer } from "~/server";
import { signupTokenExpirationHours } from "~/constants";

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
    describe("adminユーザーである", () => {
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

  describe("GET path", () => {
    describe("paramsにDBに存在するデータが入っている", () => {
      describe("有効期限が切れていない", () => {
        test("200を返し、DBからそのデータを削除する", async () => {
          const token = "token";

          // トークンを作成
          await prisma.clientSignupToken.create({
            data: {
              token,
            },
          });

          const res = await server.inject({
            method: "GET",
            url: `${clientSignupTokenPath}/${token}`,
          });

          // トークンが削除されていることを保証
          const _token = await prisma.clientSignupToken.findFirst();

          expect(res.statusCode).toEqual(200);
          expect(_token).toBeNull();
        });
      });

      describe("有効期限切れである", () => {
        test("400を返し、DBからそのデータを削除する", async () => {
          const token = "token";

          // トークンを作成
          await prisma.clientSignupToken.create({
            data: {
              token,
              createdAt: subHours(new Date(), signupTokenExpirationHours + 1), // 作成時間を手動で指定
            },
          });

          const res = await server.inject({
            method: "GET",
            url: `${clientSignupTokenPath}/${token}`,
          });

          // トークンが削除されていることを保証
          const _token = await prisma.clientSignupToken.findFirst();

          expect(res.statusCode).toEqual(400);
          expect(_token).toBeNull();
        });
      });
    });

    describe("paramsのデータがDBに存在しない", () => {
      test("400エラーを返す", async () => {
        const res = await server.inject({
          method: "GET",
          url: `${clientSignupTokenPath}/${"token"}`, // tokenはDBに存在しない
        });

        expect(res.statusCode).toEqual(400);
      });
    });
  });
});
