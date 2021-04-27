import Hapi from "@hapi/hapi";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { createErrorObj } from "~/helpers/errors";
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

// spyOnじゃなくてmock使う
// const axiosSpy = jest.spyOn(axios, "post");
// axiosSpy.mockResolvedValue({
//   data: {
//     nonce: "nonce",
//     name: "ローランド",
//     sub: "lineId",
//   },
// });

describe("sessions", () => {
  let server: Hapi.Server;

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
                // 既存データの作成
                await prisma.user.create({
                  data: {
                    lineId: hashedLineId,
                    accessToken: "token",
                    name: "圭介ホンダ",
                  },
                });

                const res = await server.inject(requestSchema);

                expect(JSON.parse(res.payload).lineId).toEqual(hashedLineId);
                expect(JSON.parse(res.payload).name).toEqual("圭介ホンダ"); // lineAPIからの戻り値ではなく既存データのもの
                expect(res.statusCode).toEqual(200);
              });
            });

            describe("Userがその時点で存在せず、新規である", () => {
              test("200と新規データを返す", async () => {
                const user = await prisma.user.findFirst({});
                expect(user).toBe(null);

                const res = await server.inject(requestSchema);

                expect(JSON.parse(res.payload).lineId).toEqual(hashedLineId);
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
                createErrorObj({ name: "loginError" })
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
          //     createErrorObj({ name: "loginError" })
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
        });
      });
    });
  });
});
