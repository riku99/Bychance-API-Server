import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { prisma } from "../../lib/prisma";
import { createUser } from "../../data/user";
import { createBlock } from "../../data/block";

const url = (targetUserId: string) => `${baseUrl}/users/${targetUserId}/block`;

const deleteData = async () => {
  await prisma.block.deleteMany();
  await prisma.user.deleteMany();
};

describe("ブロックを解除する, DELETE /users/block", () => {
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

  test("Blockが削除される", async () => {
    const requestUser = await createUser();
    const targetUser = await createUser();
    await createBlock({
      blockBy: requestUser.id,
      blockTo: targetUser.id,
    });

    const res = await server.inject({
      method: "DELETE",
      url: url(targetUser.id),
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
    expect(!!blockData).toBeFalsy();
  });
});
