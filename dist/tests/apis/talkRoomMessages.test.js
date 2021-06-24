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
describe("talkRoomMessages", () => {
    let server;
    beforeAll(async () => {
        server = await server_1.initializeServer();
    });
    afterAll(async () => {
        await prisma.user.deleteMany({});
    });
    describe("POST /talkRoomMessages", () => {
        const successfulRequestSchema = {
            method: "POST",
            url: `${url_1.baseUrl}/talkRoomMessages?id=${user.id}`,
            payload: { talkRoomId: 1, text: "Hey!!", partnerId: "2" },
            headers: { Authorization: `Bearer ${accessToken}` },
        };
        describe("バリデーションに通る", () => {
            test("TalkRoomMessageが作成され200を返す", async () => {
                await prisma.user.deleteMany({});
                await prisma.user.create({ data: user });
                await prisma.user.create({ data: user2 });
                await prisma.talkRoom.create({ data: talkRoom });
                const res = await server.inject(successfulRequestSchema);
                expect(res.statusCode).toEqual(200);
                const message = await prisma.talkRoomMessage.findMany({
                    where: {
                        userId: user.id,
                    },
                });
                expect(message.length).toEqual(1);
            });
        });
        describe("バリデーションに引っかかる", () => {
            beforeEach(async () => {
                await prisma.talkRoomMessage.deleteMany({});
                await prisma.talkRoom.deleteMany({});
                await prisma.user.deleteMany({});
            });
            test("payloadに必要なデータがないので400を返す", async () => {
                await prisma.user.create({ data: user });
                const res = await server.inject({
                    ...successfulRequestSchema,
                    payload: {}, // paylodにデータなし
                });
                expect(res.statusCode).toEqual(400);
            });
            test("payloadに余計なデータがあるので400を返す", async () => {
                await prisma.user.create({ data: user });
                const res = await server.inject({
                    ...successfulRequestSchema,
                    payload: { ...successfulRequestSchema.payload, accessToken: "12234" }, // paylodにaccessTokenという余計なデータある
                });
                expect(res.statusCode).toEqual(400);
            });
        });
    });
});
