"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("~/server");
describe("Hello World", () => {
    let server;
    beforeAll(async () => {
        server = await server_1.initializeServer();
    });
    afterAll(async () => {
        await server.stop();
    });
    test("Helo World", async () => {
        const res = await server.inject({
            method: "GET",
            url: "/",
        });
        expect(res.statusCode).toEqual(200);
        expect(res.payload).toEqual("Hello World");
    });
});
