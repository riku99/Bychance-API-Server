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
    id: 1,
    senderId: "1",
    recipientId: "2",
};
describe("deleteTalkRoom", () => {
    let server;
    beforeAll(async () => {
        server = await server_1.initializeServer();
    });
    describe("POST /deleteTalkRooms", () => {
        const successfulRequestSchema = {
            method: "POST",
            url: `${url_1.baseUrl}/deleteTalkRooms?id=${user.id}`,
            payload: { talkRoomId: 1 },
            headers: { Authorization: `Bearer ${accessToken}` },
        };
        describe("バリデーションに通る", () => {
            beforeEach(async () => {
                await prisma.talkRoom.deleteMany({});
                await prisma.user.deleteMany({});
                await prisma.user.create({ data: user });
                await prisma.user.create({ data: user2 });
                await prisma.talkRoom.create({ data: talkRoom });
            });
            afterAll(async () => {
                await prisma.deleteTalkRoom.deleteMany({});
                await prisma.talkRoom.deleteMany({});
                await prisma.user.deleteMany({});
            });
            test("データを作成し200を返す", async () => {
                const beforeData = await prisma.deleteTalkRoom.findMany({});
                expect(beforeData.length).toEqual(0);
                const res = await server.inject(successfulRequestSchema);
                expect(res.statusCode).toEqual(200);
                const afterData = await prisma.deleteTalkRoom.findMany({});
                expect(afterData.length).toEqual(1);
            });
        });
        describe("バリデーションに引っかかる", () => {
            beforeEach(async () => {
                await prisma.user.deleteMany({});
                await prisma.user.create({ data: user });
            });
            test("バリデーションに必要なデータがないので400を返す", async () => {
                const res = await server.inject({
                    ...successfulRequestSchema,
                    payload: {}, // payloadなし
                });
                expect(res.statusCode).toEqual(400);
            });
            test("バリデーションに余計なデータがあるので400を返す", async () => {
                const res = await server.inject({
                    ...successfulRequestSchema,
                    payload: {
                        ...successfulRequestSchema.payload,
                        accessToken: "derjfior", // 不必要なaccssTokenの追加
                    },
                });
                expect(res.statusCode).toEqual(400);
            });
        });
    });
});
