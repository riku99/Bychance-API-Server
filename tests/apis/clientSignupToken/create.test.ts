import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createUser } from "../../data/user";
import { prisma } from "../../lib/prisma";

const url = `${baseUrl}/client_signup_token`;

const deleteData = async () => {
  await prisma.clientSignupToken.deleteMany();
};

describe("サインアップトークンの作成, POST /client_signup_token", () => {
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

  test("サインアップトークンが作成される", async () => {
    const res = await server.inject({
      method: "POST",
      url,
      auth: {
        strategy: "console",
        artifacts: {},
        credentials: {},
      },
    });

    const createdToken = await prisma.clientSignupToken.findFirst();

    expect(res.payload).toEqual(createdToken?.token);
  });
});
