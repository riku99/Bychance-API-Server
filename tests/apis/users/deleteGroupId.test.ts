import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createUser } from "../../data/user";

const prisma = new PrismaClient();

const deleteData = async () => {
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();
};

const url = `${baseUrl}/users/group_id`;

describe("Userのgroup_id削除", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
    await deleteData();
  });

  beforeEach(async () => {
    await deleteData();
  });

  afterAll(async () => {
    await deleteData();
  });

  test("group_idが削除される", async () => {
    const user1 = await createUser();

    const group = await prisma.group.create({
      data: {
        ownerId: user1.id,
      },
    });

    const user = await createUser({
      groupId: group.id,
    });

    const res = await server.inject({
      method: "DELETE",
      url,
      auth: {
        credentials: {},
        strategy: "simple",
        artifacts: user,
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    expect(res.statusCode).toEqual(200);
    expect(updatedUser?.groupId).toBeNull();
  });

  test("groupIdが存在しなかった場合、400エラーが返される", async () => {
    const user = await createUser();

    const res = await server.inject({
      method: "DELETE",
      url,
      auth: {
        credentials: {},
        strategy: "simple",
        artifacts: user,
      },
    });

    expect(res.statusCode).toEqual(400);
  });
});
