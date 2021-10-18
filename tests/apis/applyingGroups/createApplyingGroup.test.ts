import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createUser } from "../../data/user";
import { prisma } from "../../lib/prisma";
import { createApplyingGrop } from "../../data/applyingGroups";
import { createGroup } from "../../data/groups";
import { createBlock } from "../../data/block";

const url = `${baseUrl}/applying_groups`;

const deleteData = async () => {
  await prisma.applyingGroup.deleteMany();
  await prisma.group.deleteMany();
  await prisma.block.deleteMany();
  await prisma.user.deleteMany();
};

describe("グループの申請をする, POST /applying_groups", () => {
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

  test("グループが申請される", async () => {
    const requestUser = await createUser();
    const targetUser = await createUser();

    await server.inject({
      method: "POST",
      url,
      payload: {
        to: targetUser.id,
      },
      auth: {
        strategy: "simple",
        artifacts: requestUser,
        credentials: {},
      },
    });

    const createdGroup = await prisma.applyingGroup.findFirst({
      where: {
        applyingUserId: requestUser.id,
        appliedUserId: targetUser.id,
      },
    });

    expect(!!createdGroup).toBeTruthy();
  });

  test("既に相手のユーザーに申請している場合はエラーを返し、新たに作成しない", async () => {
    const requestUser = await createUser();
    const targetUser = await createUser();

    // 既に申請済みにする
    await createApplyingGrop({
      applyingUserId: requestUser.id,
      appliedUserId: targetUser.id,
    });

    const res = await server.inject({
      method: "POST",
      url,
      payload: {
        to: targetUser.id,
      },
      auth: {
        strategy: "simple",
        artifacts: requestUser,
        credentials: {},
      },
    });

    const gr = await prisma.applyingGroup.findMany();

    expect(res.statusCode).toEqual(400);
    expect(gr.length).toEqual(1); // 新しく作成されてないことを検証
  });

  test("相手ユーザーが既にグループに入っている場合エラーを返し、新たに作成しない", async () => {
    const requestUser = await createUser();
    const anotherUser = await createUser();
    const group = await createGroup({
      ownerId: anotherUser.id,
    });
    const targetUser = await createUser({
      groupId: group.id,
    });

    const res = await server.inject({
      method: "POST",
      url,
      payload: {
        to: targetUser.id,
      },
      auth: {
        strategy: "simple",
        artifacts: requestUser,
        credentials: {},
      },
    });

    const ag = await prisma.applyingGroup.findMany();

    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res.payload).message).toEqual(
      "相手ユーザーが既にグループに入っています"
    );
    expect(ag.length).toEqual(0);
  });

  test("自分が既にグループに入っている && グループのオーナーではない場合エラーを返す", async () => {
    const anotherUser = await createUser();
    const group = await createGroup({
      ownerId: anotherUser.id,
    });
    const requestUser = await createUser({
      groupId: group.id,
    });
    const targetUser = await createUser();

    const res = await server.inject({
      method: "POST",
      url,
      payload: {
        to: targetUser.id,
      },
      auth: {
        strategy: "simple",
        artifacts: requestUser,
        credentials: {},
      },
    });

    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res.payload).message).toEqual(
      "あなたは既にグループに入っています。グループに入っている場合、申請できるのはグループのオーナーのみです"
    );
  });

  test("相手のユーザーをブロックしている場合エラーを返す", async () => {
    const requestUser = await createUser();
    const targetUser = await createUser();
    await createBlock({
      blockBy: requestUser.id,
      blockTo: targetUser.id,
    });

    const res = await server.inject({
      method: "POST",
      url,
      payload: {
        to: targetUser.id,
      },
      auth: {
        strategy: "simple",
        artifacts: requestUser,
        credentials: {},
      },
    });

    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res.payload).message).toEqual(
      "このユーザーをブロックしています。申請するにはブロックを解除してください"
    );
  });

  test("相手が自分をブロックしている場合emitは起こさない", async () => {
    let emitSpy: jest.SpyInstance;
    const mdl = require("~/helpers/applyingGroups/emitSocket");
    emitSpy = jest.spyOn(mdl, "emitApplyGroup");

    const requestUser = await createUser();
    const targetUser = await createUser();

    await createBlock({
      blockBy: targetUser.id,
      blockTo: requestUser.id,
    });

    await server.inject({
      method: "POST",
      url,
      payload: {
        to: targetUser.id,
      },
      auth: {
        strategy: "simple",
        artifacts: requestUser,
        credentials: {},
      },
    });

    expect(emitSpy).toHaveBeenCalledTimes(0);

    emitSpy.mockClear();
  });

  test("相手がグループ申請を受け取らない設定にしている場合emitしない", async () => {
    let emitSpy: jest.SpyInstance;
    const mdl = require("~/helpers/applyingGroups/emitSocket");
    emitSpy = jest.spyOn(mdl, "emitApplyGroup");

    const requestUser = await createUser();
    const targetUser = await createUser({
      groupsApplicationEnabled: false,
    });

    await server.inject({
      method: "POST",
      url,
      payload: {
        to: targetUser.id,
      },
      auth: {
        strategy: "simple",
        artifacts: requestUser,
        credentials: {},
      },
    });

    expect(emitSpy).toHaveBeenCalledTimes(0);

    emitSpy.mockClear();
  });
});
