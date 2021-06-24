"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const server_1 = require("~/server");
const url_1 = require("~/constants/url");
const crypto_1 = require("~/helpers/crypto");
const errors_1 = require("~/config/apis/errors");
const aws_1 = require("~/helpers/aws");
const flash_1 = require("~/serializers/flash");
const prisma = new client_1.PrismaClient();
const accessToken = "生accessToken";
const hashedAccessToken = crypto_1.createHash(accessToken);
const user = {
    id: "1",
    lineId: "lineId",
    accessToken: hashedAccessToken,
    name: "name",
};
const flash = {
    id: 1,
    source: "url",
    sourceType: "image",
    userId: "1",
};
const createS3ObjectPathResult = "image url";
jest.mock("~/helpers/aws");
aws_1.createS3ObjectPath.mockResolvedValue(createS3ObjectPathResult);
const serializeResult = {
    id: 1,
    source: createS3ObjectPathResult,
    sourceType: "image",
};
jest.mock("~/serializers/flash");
flash_1.serializeFlash.mockResolvedValue(serializeResult);
describe("flashes", () => {
    let server;
    beforeAll(async () => {
        server = await server_1.initializeServer();
    });
    beforeEach(async () => {
        await prisma.flash.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.user.create({ data: user });
    });
    afterAll(async () => {
        await prisma.user.deleteMany({});
    });
    describe("POST /flashes", () => {
        const successfulRequestSchema = {
            method: "POST",
            url: `${url_1.baseUrl}/flashes?id=${user.id}`,
            payload: { source: "source", sourceType: "image", ext: null },
            headers: { Authorization: `Bearer ${accessToken}` },
        };
        describe("バリデーションに通る", () => {
            test("200とシリアライズされた結果を返す", async () => {
                const res = await server.inject(successfulRequestSchema);
                expect(res.statusCode).toEqual(200);
                expect(JSON.parse(res.payload)).toEqual(serializeResult);
            });
        });
        describe("バリデーションに引っかかる", () => {
            test("payloadに必要なデータがないので400を返す", async () => {
                const req = await server.inject({
                    ...successfulRequestSchema,
                    payload: { sourceType: "image", ext: null }, // sourceなし
                });
                expect(req.statusCode).toEqual(400);
                expect(JSON.parse(req.payload).errorType).toEqual(errors_1.invalidErrorType);
            });
            test("payloadに余計なデータがあるので400を返す", async () => {
                const req = await server.inject({
                    ...successfulRequestSchema,
                    payload: { ...successfulRequestSchema.payload, accessToken: "wwwww" }, // accessTokenの追加
                });
                expect(req.statusCode).toEqual(400);
                expect(JSON.parse(req.payload).errorType).toEqual(errors_1.invalidErrorType);
            });
            test("sourceTypeが指定されたもの以外のデータなので400を返す", async () => {
                const req = await server.inject({
                    ...successfulRequestSchema,
                    payload: { ...successfulRequestSchema.payload, sourceType: "buffer" }, // sourceTypeの変更
                });
                expect(req.statusCode).toEqual(400);
                expect(JSON.parse(req.payload).errorType).toEqual(errors_1.invalidErrorType);
            });
        });
    });
    describe("DELETE /flashes/{flashId}", () => {
        const successfulRequestSchema = {
            method: "DELETE",
            url: `${url_1.baseUrl}/flashes/1?id=${user.id}`,
            headers: { Authorization: `Bearer ${accessToken}` },
        };
        describe("バリデーションに通る", () => {
            describe("保存されているflashのuserIdと送られてきたidが一致", () => {
                test("200を返す", async () => {
                    await prisma.flash.create({
                        data: flash,
                    });
                    const res = await server.inject(successfulRequestSchema);
                    expect(res.statusCode).toEqual(200);
                });
            });
            describe("一致しない", () => {
                test("400を返す", async () => {
                    await prisma.user.deleteMany({});
                    await prisma.user.create({
                        data: user,
                    });
                    // flashを作成するためのuserを作成
                    await prisma.user.create({
                        data: {
                            ...user,
                            id: "2",
                            lineId: "line2",
                            accessToken: "token2",
                        },
                    });
                    await prisma.flash.create({
                        data: {
                            ...flash,
                            userId: "2", // リクエストするuserIdとは違う値を指定
                        },
                    });
                    const res = await server.inject(successfulRequestSchema);
                    expect(res.statusCode).toEqual(400);
                    expect(JSON.parse(res.payload).errorType).toEqual(errors_1.invalidErrorType);
                });
            });
        });
        // paramsなので指定しないとバリデーションエラーより先に404返される
        // describe("バリデーションに引っかかる", () => {
        //   test("paramsに必要なデータがないので400を返す", async () => {
        //     const res = await server.inject({
        //       ...successfulRequestSchema,
        //       url: `${baseUrl}/flashes`,
        //     });
        //     expect(res.statusCode).toEqual(400);
        //     expect(JSON.parse(res.payload).errorType).toEqual(invalidErrorType);
        //   });
        //});
    });
});
