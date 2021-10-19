import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { prisma } from "../../lib/prisma";
import { createRecommendationClient } from "../../data/recommendationClient";
import { createClientAuthCode } from "../../data/clientAuthCode";

const url = `${baseUrl}/recommendation_clients/verified_email`;

const deleteData = async () => {
  await prisma.clientAuthCode.deleteMany();
  await prisma.recommendationClient.deleteMany();
};

describe("認証コードを用いたメールアドレスの検証", () => {
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

  test("virifiedEmailがtrueになり、該当のauthCodeは削除される", async () => {
    const client = await createRecommendationClient();
    const authCode = await createClientAuthCode({
      clientId: client.id,
    });

    const res = await server.inject({
      method: "PATCH",
      url,
      payload: {
        code: authCode.code,
      },
      auth: {
        strategy: "r-client",
        credentials: {},
        artifacts: client,
      },
    });

    const updatedClient = await prisma.recommendationClient.findUnique({
      where: {
        id: client.id,
      },
    });

    const targetCode = await prisma.clientAuthCode.findUnique({
      where: {
        clientId: client.id,
      },
    });

    expect(res.statusCode).toEqual(200);
    expect(updatedClient?.verifiedEmail).toBeTruthy();
    expect(targetCode).toBeNull();
  });

  test("payloadの認証コードが間違っている場合エラーを返し、該当のCientAuthCodeは消されていない", async () => {
    const client = await createRecommendationClient();
    const authCode = await createClientAuthCode({
      clientId: client.id,
    });

    const res = await server.inject({
      method: "PATCH",
      url,
      payload: {
        code: `${authCode.code}間違っとるよ`,
      },
      auth: {
        strategy: "r-client",
        credentials: {},
        artifacts: client,
      },
    });

    const _authCode = await prisma.clientAuthCode.findUnique({
      where: {
        clientId: client.id,
      },
    });

    expect(res.statusCode).toEqual(400);
    expect(!!_authCode).toBeTruthy();
  });
});
