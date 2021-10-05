import Hapi from "@hapi/hapi";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createHash } from "~/helpers/crypto";

const prisma = new PrismaClient();

const lineUserName = "デンジ";
const lineId = "生lineId";
const hashedLineId = createHash(lineId);
const accessToken = "access token";
const hashedAccessToken = createHash(accessToken);

jest.mock("axios");

// lineAPIが成功した場合を仮定
(axios.post as any).mockResolvedValue({
  data: {
    nonce: "nonce",
    name: lineUserName,
    sub: lineId,
  },
});

describe("sessions", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
  });

  beforeEach(async () => {
    console.log("run");
    await prisma.user.deleteMany({});
    await prisma.nonce.deleteMany({});
  });

  describe("Lineログイン, POST /sessions/line_login", () => {
    const url = `${baseUrl}/sessions/line_login`;

    test("ユーザーが新規の場合、新規ユーザーが作成される", async () => {
      // Arrange
      await prisma.nonce.create({
        data: {
          nonce: "nonce",
        },
      });

      // Act
      const res = await server.inject({
        method: "POST",
        url,
        headers: { Authorization: "Bearer lineId" },
      });

      // Assert
      expect(JSON.parse(res.payload).user.name).toEqual(lineUserName);
    });

    test("ユーザーが既存ユーザーの場合、既存ユーザーのデータが返される", async () => {
      // Arrange
      await prisma.nonce.create({
        data: {
          nonce: "nonce",
        },
      });

      await prisma.user.create({
        data: {
          accessToken: hashedAccessToken,
          lineId: hashedLineId,
          name: "古参マン",
        },
      });

      // Act
      const res = await server.inject({
        method: "POST",
        url,
        headers: { Authorization: "Bearer lineId" },
      });

      // Assert
      expect(JSON.parse(res.payload).user.name).toEqual("古参マン");
    });

    test("nonceが存在しない場合、401エラーを返す", async () => {
      // Arrange
      // nonce作成しない

      // Act
      const res = await server.inject({
        method: "POST",
        url,
        headers: { Authorization: "Bearer lineId" },
      });

      // Assert
      expect(res.statusCode).toEqual(401);
    });

    test("リクエストヘッダにAuthorizationが存在しない場合、401エラーを返す", async () => {
      // Arrange
      await prisma.nonce.create({
        data: {
          nonce: "nonce",
        },
      });

      // Act
      const res = await server.inject({
        method: "POST",
        url,
        // headers: { Authorization: "Bearer lineId" },
      });

      // Assert
      expect(res.statusCode).toEqual(401);
    });
  });

  describe("セッションログイン, GET /sessions/login_data", () => {
    const url = `${baseUrl}/sessions/login_data`;

    test("既存のログインデータを返す", async () => {
      // Arrange
      const user = await prisma.user.create({
        data: {
          name: "ボブ",
          lineId: "lineId",
          accessToken: hashedAccessToken,
        },
      });

      // Act
      const res = await server.inject({
        method: "GET",
        url,
        auth: {
          strategy: "simple",
          credentials: {},
          artifacts: user,
        },
      });

      // Assert
      expect(JSON.parse(res.payload).user.id).toEqual(user.id);
    });

    test("ユーザーがログアウト状態だった場合、ログイン状態に変更する", async () => {
      // Arrange
      const user = await prisma.user.create({
        data: {
          name: "ボブ",
          lineId: "lineId",
          accessToken: hashedAccessToken,
          login: false,
        },
      });

      // Act
      await server.inject({
        method: "GET",
        url,
        auth: {
          strategy: "simple",
          credentials: {},
          artifacts: user,
        },
      });

      const updatedUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      // Assert
      expect(updatedUser?.login).toBeTruthy();
    });
  });
});
