import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { prisma } from "../../lib/prisma";

import { createClientAuthCode } from "../../data/clientAuthCode";
import { createRecommendationClient } from "../../data/recommendationClient";

const url = `${baseUrl}/client_auth_code/password_reset`;

const deleteData = async () => {
  await prisma.clientAuthCode.deleteMany();
  await prisma.recommendationClient.deleteMany();
};

describe("パスワード変更のための認証コードの検証, GET /client_auth_code/password_reset", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
  });

  beforeEach(async () => {
    await deleteData();
  });

  afterAll(async () => {
    await deleteData();
  });

  test("検証が成功し該当のclientAuthCodeは削除される", async () => {
    const client = await createRecommendationClient();
    const authCodeData = await createClientAuthCode({
      clientId: client.id,
    });

    const res = await server.inject({
      method: "GET",
      url: `${url}?code=${authCodeData.code}`,
      auth: {
        strategy: "r-client",
        credentials: {},
        artifacts: client,
      },
    });

    const codeData = await prisma.clientAuthCode.findUnique({
      where: {
        clientId: client.id,
      },
    });

    expect(res.statusCode).toEqual(200);
    expect(codeData).toBeNull();
  });

  test("codeが間違っている場合はエラーを返し該当のデータは削除されない", async () => {
    const client = await createRecommendationClient();
    const authCodeData = await createClientAuthCode({
      clientId: client.id,
    });

    const res = await server.inject({
      method: "GET",
      url: `${url}?code=${authCodeData.code + "間違ってるよ"}`,
      auth: {
        strategy: "r-client",
        credentials: {},
        artifacts: client,
      },
    });

    const codeData = await prisma.clientAuthCode.findUnique({
      where: {
        clientId: client.id,
      },
    });

    expect(res.statusCode).toEqual(400);
    expect(!!codeData).toBeTruthy();
  });
});
