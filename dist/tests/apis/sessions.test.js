"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const client_1 = require("@prisma/client");
const server_1 = require("~/server");
const crypto_1 = require("~/helpers/crypto");
const errors_1 = require("~/config/apis/errors");
const url_1 = require("~/constants/url");
const prisma = new client_1.PrismaClient();
const lineId = "生lineId";
const hashedLineId = crypto_1.createHash(lineId);
const accessToken = "生accessToken";
const hashedAccessToken = crypto_1.createHash(accessToken);
const testUser = {
    lineId: hashedLineId,
    accessToken: hashedAccessToken,
    name: "範馬勇次郎",
};
jest.mock("axios");
// lineAPIが成功した場合を仮定
axios_1.default.post.mockResolvedValue({
    data: {
        nonce: "nonce",
        name: "デンジ",
        sub: lineId,
    },
});
describe("sessions", () => {
    let server;
    // beforeAll, afterAllはそれが所属しているブロックの実行に応じて1度だけ実行される
    beforeAll(async () => {
        server = await server_1.initializeServer();
        await prisma.user.deleteMany({});
        await prisma.nonce.deleteMany({});
    });
    afterAll(async () => {
        await prisma.user.deleteMany({});
        await prisma.nonce.deleteMany({});
    });
    describe("line", () => {
        describe("POST /sessions/lineLogin", () => {
            const url = `${url_1.baseUrl}/sessions/lineLogin`;
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
                            // await prisma.user.deleteMany({});
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
                                expect(res.statusCode).toEqual(200);
                                expect(JSON.parse(res.payload).user.name).toEqual("チェンソーマン"); // lineAPIからの戻り値ではなく既存データのもの
                                expect(JSON.parse(res.payload).posts).toEqual([]);
                                expect(JSON.parse(res.payload).flashes).toEqual([]);
                                expect(JSON.parse(res.payload).rooms).toEqual([]);
                                expect(JSON.parse(res.payload).messages).toEqual([]);
                                expect(JSON.parse(res.payload).chatPartners).toEqual([]);
                            });
                        });
                        describe("Userがその時点で存在せず、新規である", () => {
                            test("200と新規データを返す", async () => {
                                await prisma.user.deleteMany({});
                                const user = await prisma.user.findFirst({});
                                expect(user).toBe(null);
                                const res = await server.inject(requestSchema);
                                expect(res.statusCode).toEqual(200);
                                expect(JSON.parse(res.payload).user.name).toEqual("デンジ"); // lineAPIの戻り値のデータ(axios.postでモックしたデータ)
                                expect(JSON.parse(res.payload).posts).toEqual([]);
                                expect(JSON.parse(res.payload).flashes).toEqual([]);
                                expect(JSON.parse(res.payload).rooms).toEqual([]);
                                expect(JSON.parse(res.payload).messages).toEqual([]);
                                expect(JSON.parse(res.payload).chatPartners).toEqual([]);
                            });
                        });
                    });
                    describe("nonceが存在しない", () => {
                        test("401loginErrorを返す", async () => {
                            await prisma.nonce.deleteMany({});
                            const res = await server.inject(requestSchema);
                            expect(res.statusCode).toEqual(401);
                            expect(JSON.parse(res.payload).errorType).toEqual(errors_1.loginErrorType);
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
                    expect(JSON.parse(res.payload).errorType).toEqual(errors_1.loginErrorType);
                });
            });
        });
        describe("GET /sessions", () => {
            const url = `${url_1.baseUrl}/sessions`;
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
                                    url: url + "?id=uuid",
                                    headers: { Authorization: `Bearer ${accessToken}` }, // 上記ユーザーと同じaccessTokenを付与(ハッシュ化前)
                                });
                                expect(res.statusCode).toEqual(200);
                                expect(JSON.parse(res.payload).user.name).toEqual(testUser.name);
                                expect(JSON.parse(res.payload).posts).toEqual([]);
                                expect(JSON.parse(res.payload).flashes).toEqual([]);
                                expect(JSON.parse(res.payload).rooms).toEqual([]);
                                expect(JSON.parse(res.payload).messages).toEqual([]);
                                expect(JSON.parse(res.payload).chatPartners).toEqual([]);
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
                                    url: url + "?id=uuid",
                                    headers: { Authorization: "Bearer 間違ったトークン" }, // 上記ユーザーと異なるトークンを付与(正しいトークンんは 生accessToken)
                                });
                                expect(res.statusCode).toEqual(401);
                                expect(JSON.parse(res.payload).errorType).toEqual(errors_1.loginErrorType);
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
                                url: url + "?id=idだよーん",
                                headers: { Authorization: "Bearer accessToken" },
                            });
                            expect(res.statusCode).toEqual(401);
                            expect(JSON.parse(res.payload).errorType).toEqual(errors_1.loginErrorType);
                        });
                    });
                });
                describe("クエリにidが存在しない", () => {
                    test("エラーを返す", async () => {
                        const res = await server.inject({
                            method: "GET",
                            url,
                            headers: { Authorization: "Bearer accessToken" },
                        });
                        expect(JSON.parse(res.payload).errorType).toEqual(errors_1.loginErrorType);
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
                    expect(JSON.parse(res.payload).errorType).toEqual(errors_1.loginErrorType);
                    expect(res.statusCode).toEqual(401);
                });
            });
        });
    });
});
