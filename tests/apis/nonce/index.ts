import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";

const prisma = new PrismaClient();

afterAll(async (done) => {
  await prisma.$disconnect();
  done();
});

describe("nonce", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
  });

  afterAll(async () => {
    await prisma.nonce.deleteMany();
    await server.stop();
  });

  describe("POST /nonce", () => {
    test("nonceが作成される", async () => {
      const res = await server.inject({
        method: "POST",
        url: "/nonce",
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
        url: "/nonce",
        payload: obj,
      });
      expect(res.statusCode).toEqual(500);
    });

    test("payloadがないとエラー", async () => {
      const res = await server.inject({
        method: "POST",
        url: "/nonce",
      });

      expect(res.statusCode).toEqual(400);
    });
  });
});
