import Hapi from "@hapi/hapi";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { createErrorBody } from "~/helpers/errors";
import { createHash } from "~/helpers/crypto";

const prisma = new PrismaClient();

jest.mock("axios");

// lineAPIが成功した場合を仮定
(axios.post as any).mockResolvedValue({
  data: {
    nonce: "nonce",
    name: "ローランド",
    sub: "lineId",
  },
});

describe("sessions", () => {
  let server: Hapi.Server;

  // beforeAll, afterAllはそれが所属しているブロックの実行に応じて1度だけ実行される
  beforeAll(async () => {
    server = await initializeServer();
    await prisma.user.deleteMany({});
    await prisma.nonce.deleteMany({});
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.nonce.deleteMany({});
  });

  describe("line", () => {
    describe("POST /sessions/lineLogin", () => {
      const url = "/sessions/lineLogin";

      describe("headersが適切に指定されている", () => {
        const requestSchema = {
          method: "POST",
          url,
          headers: { Authorization: "Bearer lineId" },
        };

        describe("lineAPIの検証が成功", () => {
          describe("nonceが存在する", () => {
            // beforeEachはそのブロック内のテストに対してネストも含めて毎回行われる
            beforeEach(async () => {
              await prisma.user.deleteMany({});
              await prisma.nonce.deleteMany({});

              // 既存nonceの作成
              await prisma.nonce.create({
                data: {
                  nonce: "nonce",
                },
              });
            });

            const hashedLineId = createHash("lineId");

            describe("Userが既に存在する", () => {
              test("200と既存のデータを返す", async () => {
                await prisma.user.deleteMany({});
                // 既存データの作成
                await prisma.user.create({
                  data: {
                    lineId: hashedLineId,
                    accessToken: "token",
                    name: "圭介ホンダ",
                  },
                });

                const res = await server.inject(requestSchema);

                expect(JSON.parse(res.payload).name).toEqual("圭介ホンダ"); // lineAPIからの戻り値ではなく既存データのもの
                expect(res.statusCode).toEqual(200);
              });
            });

            describe("Userがその時点で存在せず、新規である", () => {
              test("200と新規データを返す", async () => {
                const user = await prisma.user.findFirst({});
                expect(user).toBe(null);

                const res = await server.inject(requestSchema);

                expect(JSON.parse(res.payload).name).toEqual("ローランド"); // lineAPIの戻り値のデータ
                expect(res.statusCode).toEqual(200);
              });
            });
          });

          describe("nonceが存在しない", () => {
            test("400でloginError", async () => {
              await prisma.nonce.deleteMany({});

              const res = await server.inject(requestSchema);

              expect(JSON.parse(res.payload)).toEqual(
                createErrorBody({ name: "loginError" })
              );
            });
          });
        });

        describe("lineApiの検証が失敗", () => {
          // mock関数ないでエラーをスローする方法が分からなかったのでいったんコメント
          // test("400とloginErrorを返す", async () => {
          //   const res = await server.inject({
          //     method: "POST",
          //     url,
          //     headers: { Authorization: "Bearer ヘッダー" },
          //   });
          //   expect(res.statusCode).toEqual(400);
          //   expect(JSON.parse(res.payload)).toEqual(
          //     createErrorBody({ name: "loginError" })
          //   );
          // });
        });
      });

      describe("headersが指定されていない", () => {
        const requestSchema = {
          method: "POST",
          url,
        };
        test("400を返す", async () => {
          const res = await server.inject(requestSchema);

          expect(res.statusCode).toEqual(400);
          expect(JSON.parse(res.payload)).toEqual(
            createErrorBody({ name: "loginError" })
          );
        });
      });
    });

    describe("GET /sessions", () => {
      test("session", async () => {
        const res = server.inject({
          method: "GET",
          url: "/sessions",
          headers: { Authorization: "Bearer lineId" },
        });
      });
    });
  });
});
