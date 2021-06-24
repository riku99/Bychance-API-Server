"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const server_1 = require("~/server");
const errors_1 = require("~/config/apis/errors");
const url_1 = require("~/constants/url");
const prisma = new client_1.PrismaClient();
describe("nonce", () => {
    let server;
    beforeAll(async () => {
        server = await server_1.initializeServer();
    });
    afterAll(async () => {
        await prisma.nonce.deleteMany({});
    });
    describe("POST /nonce", () => {
        test("nonceが作成される", async () => {
            const res = await server.inject({
                method: "POST",
                url: `${url_1.baseUrl}/nonce`,
                payload: { nonce: `腰が痛いヨ${Date.now()}` },
            });
            expect(res.statusCode).toEqual(200);
            expect(res.payload).toEqual("");
        });
        test("同じ値のnonce入れようとするとユニークなやつのエラーでる", async () => {
            const obj = { nonce: "同じやつ" };
            await prisma.nonce.create({
                data: obj,
            });
            const res = await server.inject({
                method: "POST",
                url: `${url_1.baseUrl}/nonce`,
                payload: obj,
            });
            expect(res.statusCode).toEqual(500);
        });
        test("payloadがないと401loginError返す", async () => {
            const res = await server.inject({
                method: "POST",
                url: `${url_1.baseUrl}/nonce`,
            });
            expect(res.statusCode).toEqual(401);
            expect(JSON.parse(res.payload).errorType).toEqual(errors_1.loginErrorType);
        });
    });
});
