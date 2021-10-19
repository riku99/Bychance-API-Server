import Hapi from "@hapi/hapi";
import { subHours } from "date-fns";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { prisma } from "../../lib/prisma";
import { createSignupToken } from "../../data/clientSignupToken";

const url = (token: string) => `${baseUrl}/client_signup_token/${token}`;

const deleteData = async () => {
  await prisma.clientSignupToken.deleteMany();
};

describe("サインアップトークンの検証, GET client_signup_token/{token}", () => {
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

  test("サインアップトークンが認証され、DBから削除される", async () => {
    const { token } = await createSignupToken();

    const res = await server.inject({
      method: "GET",
      url: url(token),
    });

    const t = await prisma.clientSignupToken.findFirst();

    expect(res.statusCode).toEqual(200);
    expect(t).toBeNull();
  });

  test("トークンが間違っている場合エラーを返し、作成したものは削除されない", async () => {
    await createSignupToken();

    const res = await server.inject({
      method: "GET",
      url: url("failToken"),
    });

    const t = await prisma.clientSignupToken.findFirst();

    expect(res.statusCode).toEqual(400);
    expect(!!t).toBeTruthy();
  });

  test("正しいものでも作成から6時間を超えていた場合エラーを返す", async () => {
    const { token } = await createSignupToken({
      createdAt: subHours(new Date(), 7),
    });

    const res = await server.inject({
      method: "GET",
      url: url(token),
    });

    expect(res.statusCode).toEqual(400);
  });
});
