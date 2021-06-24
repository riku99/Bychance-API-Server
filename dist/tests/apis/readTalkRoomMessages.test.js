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
const talkRoomMessage = {
    id: 1,
    text: "Hey",
    userId: "2",
    roomId: 1,
};
const talkRoomMessage2 = {
    id: 2,
    text: "ok",
    userId: "2",
    roomId: 1,
};
describe("readTalkRoomMessages", () => {
    let server;
    beforeAll(async () => {
        server = await server_1.initializeServer();
        await prisma.user.deleteMany({});
        await prisma.user.create({ data: user });
        await prisma.user.create({ data: user2 });
    });
    describe("POST /readTalkRoomMessages", () => {
        const successfulRequestSchema = {
            method: "POST",
            url: `${url_1.baseUrl}/readTalkRoomMessages?id=${user.id}`,
            payload: { talkRoomId: 1, partnerId: "2", unreadNumber: 2 },
            headers: { Authorization: `Bearer ${accessToken}` },
        };
        describe("バリデーションに通る", () => {
            beforeEach(async () => {
                await prisma.readTalkRoomMessage.deleteMany({});
                await prisma.talkRoomMessage.deleteMany({});
                await prisma.talkRoom.deleteMany({});
            });
            test("データが作成されて200を返す", async () => {
                await prisma.talkRoom.create({ data: talkRoom });
                await prisma.talkRoomMessage.create({ data: talkRoomMessage });
                await prisma.talkRoomMessage.create({ data: talkRoomMessage2 });
                const beforeRequestData = await prisma.readTalkRoomMessage.findMany({});
                expect(beforeRequestData.length).toEqual(0);
                const res = await server.inject(successfulRequestSchema);
                expect(res.statusCode).toEqual(200);
                const data = await prisma.readTalkRoomMessage.findMany({});
                expect(data.length).toEqual(2);
            });
        });
        describe("バリデーションに引っかかる", () => {
            test("payloadに必要なデータがないので400を返す", async () => {
                const res = await server.inject({
                    ...successfulRequestSchema,
                    payload: {}, // payload空にする
                });
                expect(res.statusCode).toEqual(400);
            });
            test("payloadに余計なデータがるので400を返す", async () => {
                const res = await server.inject({
                    ...successfulRequestSchema,
                    payload: {
                        ...successfulRequestSchema.payload,
                        accessToken: "334040", // accessTokenぶち込む
                    },
                });
                expect(res.statusCode).toEqual(400);
            });
        });
    });
});
