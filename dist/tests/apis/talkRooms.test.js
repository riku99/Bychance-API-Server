"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const server_1 = require("~/server");
const url_1 = require("~/constants/url");
const crypto_1 = require("~/helpers/crypto");
const prisma = new client_1.PrismaClient();
const accessToken = "生accessToken";
const hashedAccessToken = crypto_1.createHash(accessToken);
const accessToken2 = "生accessToken2";
const hashedAccessToken2 = crypto_1.createHash(accessToken2);
const user = {
    id: "1",
    lineId: "lineId",
    accessToken: hashedAccessToken,
    name: "たん二郎",
};
const user2 = {
    id: "2",
    lineId: "lineId2",
    accessToken: hashedAccessToken2,
    name: "姫の",
};
const talkRoom = {
    senderId: "1",
    recipientId: "2",
};
describe("talkRooms", () => {
    let server;
    beforeAll(async () => {
        server = await server_1.initializeServer();
    });
    afterAll(async () => {
        await prisma.user.deleteMany({});
    });
    describe("POST /talkRooms", () => {
        const successfulRequestSchema = {
            method: "POST",
            url: `${url_1.baseUrl}/talkRooms?id=${user.id}`,
            payload: { partnerId: "2" },
            headers: { Authorization: `Bearer ${accessToken}` },
        };
        describe("バリデーションに通る", () => {
            describe("トークルームが既に存在する", () => {
                beforeEach(async () => {
                    await prisma.talkRoom.deleteMany({});
                    await prisma.user.deleteMany({});
                });
                test("作成されずに200を返す", async () => {
                    await prisma.user.create({ data: user });
                    await prisma.user.create({ data: user2 });
                    await prisma.talkRoom.create({ data: talkRoom });
                    const talkRooms = await prisma.talkRoom.findMany({
                        where: {
                            OR: [
                                {
                                    senderId: user.id,
                                    recipientId: user2.id,
                                },
                                {
                                    senderId: user2.id,
                                    recipientId: user.id,
                                },
                            ],
                        },
                    });
                    expect(talkRooms.length).toEqual(1); // 既にトークルームが存在していることを保証
                    const res = await server.inject(successfulRequestSchema);
                    expect(res.statusCode).toEqual(200);
                    const afterRequestTalkRooms = await prisma.talkRoom.findMany({
                        where: {
                            OR: [
                                {
                                    senderId: user.id,
                                    recipientId: user2.id,
                                },
                                {
                                    senderId: user2.id,
                                    recipientId: user.id,
                                },
                            ],
                        },
                    });
                    expect(afterRequestTalkRooms.length).toEqual(1); // リクエストのあともデータが作成されていないことを検証
                });
            });
            describe("トークルームが新規である", () => {
                test("作成され200を返す", async () => {
                    await prisma.talkRoom.deleteMany({});
                    await prisma.user.deleteMany({});
                    await prisma.user.create({ data: user });
                    await prisma.user.create({ data: user2 });
                    const talkRooms = await prisma.talkRoom.findMany({
                        where: {
                            OR: [
                                {
                                    senderId: user.id,
                                    recipientId: user2.id,
                                },
                                {
                                    senderId: user2.id,
                                    recipientId: user.id,
                                },
                            ],
                        },
                    });
                    expect(talkRooms.length).toEqual(0); // トークルームが存在しないことを保証
                    const res = await server.inject(successfulRequestSchema);
                    expect(res.statusCode).toEqual(200);
                    const afterRequestTalkRooms = await prisma.talkRoom.findMany({
                        where: {
                            OR: [
                                {
                                    senderId: user.id,
                                    recipientId: user2.id,
                                },
                                {
                                    senderId: user2.id,
                                    recipientId: user.id,
                                },
                            ],
                        },
                    });
                    expect(afterRequestTalkRooms.length).toEqual(1); // リクエストの後はデータが作成されていることを検証
                });
            });
        });
        describe("バリデーションに引っかかる", () => {
            beforeEach(async () => {
                await prisma.talkRoom.deleteMany({});
                await prisma.user.deleteMany({});
            });
            test("必要なデータが存在しないので400を返す", async () => {
                await prisma.user.create({ data: user });
                const res = await server.inject({
                    ...successfulRequestSchema,
                    payload: {}, // payloadが空
                });
                expect(res.statusCode).toEqual(400);
            });
            test("余計なデータが存在するので400を返す", async () => {
                await prisma.user.create({ data: user });
                const res = await server.inject({
                    ...successfulRequestSchema,
                    payload: { accessToken: "11112222" }, // payloadにいらないデータ(accessToken)がある
                });
                expect(res.statusCode).toEqual(400);
            });
        });
    });
});
