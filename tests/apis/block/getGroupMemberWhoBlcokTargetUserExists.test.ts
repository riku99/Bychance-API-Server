import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { prisma } from "../../lib/prisma";
import { createUser } from "../../data/user";
import { createBlock } from "../../data/block";
import { createGroup } from "../../data/groups";

const url = (targetUserId: string) =>
  `${baseUrl}/groups/members/block/${targetUserId}`;

const deleteData = async () => {
  await prisma.group.deleteMany();
  await prisma.block.deleteMany();
  await prisma.user.deleteMany();
};

describe("グループメンバーに対象のユーザーをブロックしているユーザーがいるかどうか, GET /groups/members/block/${targetUserId}", () => {
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

  test("グループメンバーに対象のユーザーをブロックしているユーザーがいる場合、trueを返す", async () => {
    const owner = await createUser();
    const group = await createGroup({
      ownerId: owner.id,
    });
    const requestUser = await createUser({
      groupId: group.id,
    });
    const targetUser = await createUser();
    const groupMemberWhoBlockTargetUser = await createUser({
      groupId: group.id,
    });
    await createBlock({
      blockBy: groupMemberWhoBlockTargetUser.id,
      blockTo: targetUser.id,
    });

    const res = await server.inject({
      method: "GET",
      url: url(targetUser.id),
      auth: {
        strategy: "simple",
        credentials: {},
        artifacts: requestUser,
      },
    });

    expect(JSON.parse(res.payload)).toEqual(true);
  });

  test("グループメンバーに対象のユーザーをブロックしているユーザーがいなかった場合、falseを返す", async () => {
    const owner = await createUser();
    const group = await createGroup({
      ownerId: owner.id,
    });
    const requestUser = await createUser({
      groupId: group.id,
    });
    const targetUser = await createUser();
    const groupMemberWhoNotBlockTargetUser = await createUser({
      groupId: group.id,
    });

    const res = await server.inject({
      method: "GET",
      url: url(targetUser.id),
      auth: {
        strategy: "simple",
        credentials: {},
        artifacts: requestUser,
      },
    });

    expect(JSON.parse(res.payload)).toEqual(false);
  });
});
