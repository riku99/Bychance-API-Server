"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const server_1 = require("~/server");
const url_1 = require("~/constants/url");
const crypto_1 = require("~/helpers/crypto");
const aws_1 = require("~/helpers/aws");
const user_1 = require("~/serializers/user");
const prisma = new client_1.PrismaClient();
const accessToken = "生accessToken";
const hashedAccessToken = crypto_1.createHash(accessToken);
jest.mock("~/helpers/aws");
aws_1.createS3ObjectPath.mockResolvedValue("image url");
const user = {
    id: "1",
    lineId: "lineId",
    accessToken: hashedAccessToken,
    name: "name",
};
const updatePayload = {
    name: "パワー",
    introduce: "ワシが最強じゃ",
    statusMessage: "血をくれ",
    avatar: "url",
    deleteImage: false,
};
describe("users", () => {
    let server;
    beforeAll(async () => {
        server = await server_1.initializeServer();
        await prisma.user.deleteMany({});
    });
    beforeEach(async () => {
        await prisma.user.deleteMany({});
    });
    afterAll(async () => {
        await prisma.user.deleteMany({});
    });
    describe("POST /users", () => {
        test("200返す", async () => {
            await prisma.user.create({ data: user });
            const res = await server.inject({
                method: "PATCH",
                url: `${url_1.baseUrl}/users?id=${user.id}`,
                headers: { Authorization: `Bearer ${accessToken}` },
                payload: updatePayload,
            });
            expect(res.statusCode).toEqual(200);
            expect(JSON.parse(res.payload).name).toEqual(updatePayload.name);
            expect(JSON.parse(res.payload).introduce).toEqual(updatePayload.introduce);
            expect(JSON.parse(res.payload).statusMessage).toEqual(updatePayload.statusMessage);
            expect(JSON.parse(res.payload).avatar).toEqual("image url"); // creates3Objectが返した結果
        });
        test("avatarはなくてokだし、introduce、statusMessageは空文字でok", async () => {
            await prisma.user.deleteMany({});
            await prisma.user.create({ data: user });
            const res = await server.inject({
                method: "PATCH",
                url: `${url_1.baseUrl}/users?id=${user.id}`,
                // avatarなし
                payload: {
                    name: "riku",
                    introduce: "",
                    statusMessage: "",
                    deleteImage: false,
                },
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            expect(res.statusCode).toEqual(200);
        });
        test("payloadにnameがないと400エラーを返す", async () => {
            await prisma.user.create({ data: user });
            const { name, ...rest } = updatePayload; // nameとる
            const res = await server.inject({
                method: "PATCH",
                url: `${url_1.baseUrl}/users?id=${user.id}`,
                payload: rest,
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            expect(res.statusCode).toEqual(400);
        });
        test("許可されていないフィールドがあると400エラーを返す", async () => {
            await prisma.user.create({ data: user });
            const res = await server.inject({
                method: "PATCH",
                url: `${url_1.baseUrl}/users?id=${user.id}`,
                payload: { ...updatePayload, accessToken: "12345" },
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            expect(res.statusCode).toEqual(400);
        });
    });
    describe("PATCH /users/refresh", () => {
        describe("バリデーションが通る", () => {
            describe("自分のデータに対して更新をかける", () => {
                test("200とuserを返す", async () => {
                    const _user = await prisma.user.create({
                        data: user,
                    });
                    const res = await server.inject({
                        method: "PATCH",
                        url: `${url_1.baseUrl}/users/refresh?id=${user.id}`,
                        payload: { userId: "1" },
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    const expectedData = {
                        isMyData: true,
                        data: user_1.serializeUser({ user: _user }),
                    };
                    expect(res.statusCode).toEqual(200);
                    expect(JSON.parse(res.payload)).toEqual(expectedData);
                });
            });
            describe("バリデーション失敗する", () => {
                test("payloadにuserIdがないので400エラー", async () => {
                    await prisma.user.create({
                        data: user,
                    });
                    // payloadなし
                    const res = await server.inject({
                        method: "PATCH",
                        url: `${url_1.baseUrl}/users/refresh?id=${user.id}`,
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    expect(res.statusCode).toEqual(400);
                });
                test("payloadに不必要なデータが含まれている場合400エラー", async () => {
                    await prisma.user.create({
                        data: user,
                    });
                    const res = await server.inject({
                        method: "PATCH",
                        url: `${url_1.baseUrl}/users/refresh?id=${user.id}`,
                        payload: { userId: "1", accessToken: "1234" },
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    expect(res.statusCode).toEqual(400);
                });
            });
        });
    });
    describe("PATCH /users/location", () => {
        beforeEach(async () => {
            await prisma.user.deleteMany({});
        });
        describe("バリデーションに通る", () => {
            test("200を返す", async () => {
                await prisma.user.deleteMany({});
                await prisma.user.create({
                    data: user,
                });
                const res = await server.inject({
                    method: "PATCH",
                    url: `${url_1.baseUrl}/users/location?id=${user.id}`,
                    payload: { lat: 10, lng: 15 },
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                expect(res.statusCode).toEqual(200);
            });
        });
        describe("バリデーションに引っかかる", () => {
            test("payloadに必要なデータがないため400エラーを返す", async () => {
                await prisma.user.create({
                    data: user,
                });
                const res = await server.inject({
                    method: "PATCH",
                    url: `${url_1.baseUrl}/users/location?id=${user.id}`,
                    payload: {},
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                expect(res.statusCode).toEqual(400);
            });
        });
    });
    describe("PATCH /users/display", () => {
        beforeEach(async () => {
            await prisma.user.create({
                data: user,
            });
        });
        describe("バリデーションに通る", () => {
            test("200を返す", async () => {
                const res = await server.inject({
                    method: "PATCH",
                    url: `${url_1.baseUrl}/users/display?id=${user.id}`,
                    payload: { display: true },
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                expect(res.statusCode).toEqual(200);
            });
        });
        describe("バリデーションに引っかかる", () => {
            test("displayがないため400エラー", async () => {
                const res = await server.inject({
                    method: "PATCH",
                    url: `${url_1.baseUrl}/users/display?id=${user.id}`,
                    payload: {},
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                expect(res.statusCode).toEqual(400);
            });
            test("余計なデータが存在するため400エラー", async () => {
                const res = await server.inject({
                    method: "PATCH",
                    url: `${url_1.baseUrl}/users/display?id=${user.id}`,
                    payload: { accessToken: "acessToken" },
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                expect(res.statusCode).toEqual(400);
            });
        });
    });
});
