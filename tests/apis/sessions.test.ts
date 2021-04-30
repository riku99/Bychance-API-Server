import Hapi from "@hapi/hapi";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { createHash } from "~/helpers/crypto";
import { loginErrorType } from "~/config/apis/errors";

const prisma = new PrismaClient();

const lineId = "生lineId";
const hashedLineId = createHash(lineId);

const accessToken = "生accessToken";
const hashedAccessToken = createHash(accessToken);

const testUser = {
  lineId: hashedLineId,
  accessToken: hashedAccessToken,
  name: "範馬勇次郎",
};

jest.mock("axios");

// lineAPIが成功した場合を仮定
(axios.post as any).mockResolvedValue({
  data: {
    nonce: "nonce",
    name: "デンジ",
    sub: lineId,
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

            describe("Userが既に存在する", () => {
              test("200と既存のデータを返す", async () => {
                await prisma.user.deleteMany({});
                // 既存データの作成
                await prisma.user.create({
                  data: {
                    lineId: hashedLineId,
                    accessToken: "token",
                    name: "チェンソーマン",
                  },
                });

                const res = await server.inject({
                  method: "POST",
                  url,
                  headers: { Authorization: `Bearer ${lineId}` },
                });

                expect(JSON.parse(res.payload).user.name).toEqual(
                  "チェンソーマン"
                ); // lineAPIからの戻り値ではなく既存データのもの
                expect(JSON.parse(res.payload).posts).toEqual([]);
                expect(JSON.parse(res.payload).flashes).toEqual([]);
                expect(JSON.parse(res.payload).rooms).toEqual([]);
                expect(JSON.parse(res.payload).messages).toEqual([]);
                expect(JSON.parse(res.payload).chatPartners).toEqual([]);
                expect(res.statusCode).toEqual(200);
              });
            });

            describe("Userがその時点で存在せず、新規である", () => {
              test("200と新規データを返す", async () => {
                const user = await prisma.user.findFirst({});
                expect(user).toBe(null);

                const res = await server.inject(requestSchema);

                expect(JSON.parse(res.payload).name).toEqual("デンジ"); // lineAPIの戻り値のデータ(axios.postでモックしたデータ)
                expect(res.statusCode).toEqual(200);
              });
            });
          });

          describe("nonceが存在しない", () => {
            test("401loginErrorを返す", async () => {
              await prisma.nonce.deleteMany({});

              const res = await server.inject(requestSchema);

              expect(res.statusCode).toEqual(401);
              expect(JSON.parse(res.payload).errorType).toEqual(loginErrorType);
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
        test("401loginErrorを返す", async () => {
          const res = await server.inject(requestSchema);

          expect(res.statusCode).toEqual(401);
          expect(JSON.parse(res.payload).errorType).toEqual(loginErrorType);
        });
      });
    });

    describe("GET /sessions", () => {
      const url = "/sessions";

      describe("Bearerが存在する", () => {
        describe("クエリにidが存在する", () => {
          describe("idからユーザーを見つけることができる", () => {
            describe("ユーザーのaccessTokenとヘッダーで送られてきたaccessTokenのハッシュと一致する", () => {
              test("シリアライズされたデータを返す", async () => {
                await prisma.user.deleteMany({});

                const user = await prisma.user.create({
                  data: {
                    id: "uuid",
                    ...testUser,
                  },
                });

                const _user = await prisma.user.findUnique({
                  where: { id: "uuid" },
                });

                expect(_user).toEqual(user); // 正しいidを渡すとuserを取り出せることを保証

                const res = await server.inject({
                  method: "GET",
                  url: url + "?id=uuid", // 上記ユーザーと同じidを付与
                  headers: { Authorization: `Bearer ${accessToken}` }, // 上記ユーザーと同じaccessTokenを付与(ハッシュ化前)
                });

                expect(res.statusCode).toEqual(200);
              });
            });

            describe("ユーザーのaccessTokenとヘッダーで送られてきたaccessTokenのハッシュと一致しない", () => {
              test("エラーを返す", async () => {
                await prisma.user.deleteMany({});

                const user = await prisma.user.create({
                  data: {
                    id: "uuid",
                    ...testUser,
                  },
                });

                const _user = await prisma.user.findUnique({
                  where: { id: "uuid" },
                });

                expect(_user).toEqual(user); // 正しいidを渡すとuserを取り出せることを保証

                const res = await server.inject({
                  method: "GET",
                  url: url + "?id=uuid", // 上記ユーザーと同じidを付与
                  headers: { Authorization: "Bearer 間違ったトークン" }, // 上記ユーザーと異なるトークンを付与(正しいトークンんは 生accessToken)
                });

                expect(res.statusCode).toEqual(401);
                expect(JSON.parse(res.payload).errorType).toEqual(
                  loginErrorType
                );
              });
            });
          });

          describe("idからユーザーを見つけることができない", () => {
            test("エラーを返す", async () => {
              await prisma.user.deleteMany({});

              const user = await prisma.user.create({
                data: {
                  id: "一致しないuuid",
                  ...testUser,
                },
              });

              const _user = await prisma.user.findUnique({
                where: { id: "一致しないuuid" },
              });

              expect(_user).toEqual(user); // 正しいidを渡すとuserを取り出せることを保証

              const res = await server.inject({
                method: "GET",
                url: url + "?id=idだよーん", // 上のuserと異なるidをクエリに付与
                headers: { Authorization: "Bearer accessToken" },
              });

              expect(res.statusCode).toEqual(401);
              expect(JSON.parse(res.payload).errorType).toEqual(loginErrorType);
            });
          });
        });

        describe("クエリにidが存在しない", () => {
          test("エラーを返す", async () => {
            const res = await server.inject({
              method: "GET",
              url, // クエリつけてない
              headers: { Authorization: "Bearer accessToken" },
            });

            expect(JSON.parse(res.payload).errorType).toEqual(loginErrorType);
            expect(res.statusCode).toEqual(401);
          });
        });
      });

      describe("Bearerが存在しない", () => {
        test("エラーを返す", async () => {
          const res = await server.inject({
            method: "GET",
            url: url + "?=id",
            // headerつけない
          });

          expect(JSON.parse(res.payload).errorType).toEqual(loginErrorType);
          expect(res.statusCode).toEqual(401);
        });
      });
    });
  });
});
