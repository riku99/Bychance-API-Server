import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { prisma } from "../../lib/prisma";
import { createUser } from "../../data/user";

const url = `${baseUrl}/users/block`;

const deleteData = async () => {
  await prisma.block.deleteMany();
  await prisma.user.deleteMany();
};

describe("ブロックする, POST /users/block", () => {
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

  test("Blockが作成される", async () => {
    const requestUser = await createUser();
    const targetUser = await createUser();

    const res = await server.inject({
      method: "POST",
      url,
      payload: {
        blockTo: targetUser.id,
      },
      auth: {
        credentials: {},
        strategy: "simple",
        artifacts: requestUser,
      },
    });

    const blockData = await prisma.block.findFirst({
      where: {
        blockBy: requestUser.id,
      },
    });

    expect(res.statusCode).toEqual(200);
    expect(!!blockData).toBeTruthy();
  });
});
