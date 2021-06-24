"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const server_1 = require("~/server");
const url_1 = require("~/constants/url");
const crypto_1 = require("~/helpers/crypto");
const aws_1 = require("~/helpers/aws");
const errors_1 = require("~/config/apis/errors");
const prisma = new client_1.PrismaClient();
const accessToken = "生accessToken";
const hashedAccessToken = crypto_1.createHash(accessToken);
const user = {
    id: "1",
    lineId: "lineId",
    accessToken: hashedAccessToken,
    name: "name",
};
const post = {
    id: 1,
    text: "Hey",
    image: "url",
    userId: user.id,
};
const createS3ObjectPathResult = "image url";
jest.mock("~/helpers/aws");
aws_1.createS3ObjectPath.mockResolvedValue(createS3ObjectPathResult);
describe("posts", () => {
    let server;
    beforeAll(async () => {
        server = await server_1.initializeServer();
    });
    beforeEach(async () => {
        await prisma.post.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.user.create({ data: user });
    });
    afterAll(async () => {
        await prisma.post.deleteMany({});
        await prisma.user.deleteMany({});
    });
    describe("POST /posts", () => {
        describe("バリデーションに通る", () => {
            test("200とデータを返す", async () => {
                const res = await server.inject({
                    method: "POST",
                    url: `${url_1.baseUrl}/posts?id=${user.id}`,
                    payload: { text: "text", image: "image" },
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(res.payload).image).toEqual(createS3ObjectPathResult);
                expect(JSON.parse(res.payload).text).toEqual("text");
            });
        });
        describe("バリデーションに通らない", () => {
            test("payloadに必要なデータがないので400を返す", async () => {
                const res = await server.inject({
                    method: "POST",
                    url: `${url_1.baseUrl}/posts?id=${user.id}`,
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                expect(res.statusCode).toEqual(400);
                expect(JSON.parse(res.payload).errorType).toEqual(errors_1.invalidErrorType);
            });
            test("payloadに余計なデータがあるので400を返す", async () => {
                const res = await server.inject({
                    method: "POST",
                    url: `${url_1.baseUrl}/posts?id=${user.id}`,
                    payload: { text: "text", image: "image", accessToken: "token" },
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                expect(res.statusCode).toEqual(400);
                expect(JSON.parse(res.payload).errorType).toEqual(errors_1.invalidErrorType);
            });
        });
    });
    describe("DELETE /posts", () => {
        describe("バリデーションに通る", () => {
            describe("保存されているpostのuserIdと送られてきたIdが一致", () => {
                test("200を返し、削除が完了している", async () => {
                    await prisma.post.create({
                        data: post,
                    });
                    const res = await server.inject({
                        method: "DELETE",
                        url: `${url_1.baseUrl}/posts?id=${user.id}`,
                        payload: { postId: post.id },
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    expect(res.statusCode).toEqual(200);
                    const noPost = await prisma.post.findUnique({
                        where: {
                            id: post.id,
                        },
                    });
                    expect(noPost).toBe(null);
                });
            });
            describe("保存されているpostのuserIdと送られてきたIdが違う", () => {
                test("postを見つけることができずに400を返す", async () => {
                    // postを作成するため関連するuserを作成
                    await prisma.user.create({
                        data: {
                            id: "2",
                            accessToken: "token",
                            lineId: "id",
                            name: "ビーム",
                        },
                    });
                    await prisma.post.create({
                        data: {
                            ...post,
                            userId: "2", // 送られてくるuserIdと違う物を設定。idが"2"のuserいなかったらエラー出る
                        },
                    });
                    const res = await server.inject({
                        method: "DELETE",
                        url: `${url_1.baseUrl}/posts?id=${user.id}`,
                        payload: { postId: post.id },
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    expect(res.statusCode).toEqual(400);
                    expect(JSON.parse(res.payload).errorType).toEqual(errors_1.invalidErrorType);
                });
            });
        });
        describe("バリデーションに通らない", () => {
            test("payloadに必要なデータがないので400返す", async () => {
                const res = await server.inject({
                    method: "DELETE",
                    url: `${url_1.baseUrl}/posts?id=${user.id}`,
                    payload: {},
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                expect(res.statusCode).toEqual(400);
                expect(JSON.parse(res.payload).errorType).toEqual(errors_1.invalidErrorType);
            });
            test("payloadに不必要なデータがるので400を返す", async () => {
                const res = await server.inject({
                    method: "DELETE",
                    url: `${url_1.baseUrl}/posts?id=${user.id}`,
                    payload: { postId: 1, accessToken: "token" },
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                expect(res.statusCode).toEqual(400);
                expect(JSON.parse(res.payload).errorType).toEqual(errors_1.invalidErrorType);
            });
        });
    });
});
