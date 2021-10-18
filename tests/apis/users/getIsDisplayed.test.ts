import Hapi from "@hapi/hapi";
import { Prisma } from "@prisma/client";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createUser } from "../../data/user";
import { prisma } from "../../lib/prisma";

const url = `${baseUrl}/users/is_displayed`;

const deleteData = async () => {
  await prisma.user.deleteMany();
};

describe("ユーザーが現在他のユーザーに表示されているかどうかを取得, GET /users/is_displayed", () => {
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

  // テストでは「Aが ~ の場合レスポンスはどうか」をとりたい。
  // createUserを使うと、例えば「{login: false}の時にfalseを返す」というテストなのに、{display: true}によりfalseが返されてしまう可能性もある
  // なのでここで関連するデータはセットアプしとく
  const createUserWithRelatedData = async (
    data: Partial<Prisma.UserCreateArgs["data"]>
  ) => {
    return await createUser({
      login: true,
      display: true,
      lat: "lat",
      lng: "lng",
      inPrivateZone: false,
      ...data,
    });
  };

  test("表示状態なのでtrueを返す", async () => {
    const user = await createUserWithRelatedData({});

    const res = await server.inject({
      method: "GET",
      url,
      auth: {
        artifacts: user,
        credentials: {},
        strategy: "simple",
      },
    });

    expect(JSON.parse(res.payload)).toBeTruthy();
  });

  test("ログアウト中の場合はfalseを返す", async () => {
    const user = await createUserWithRelatedData({
      login: false,
    });

    const res = await server.inject({
      method: "GET",
      url,
      auth: {
        artifacts: user,
        credentials: {},
        strategy: "simple",
      },
    });

    expect(JSON.parse(res.payload)).toBeFalsy();
  });

  test("displayがfalseの場合はfalseを返す", async () => {
    const user = await createUserWithRelatedData({
      display: false,
    });

    const res = await server.inject({
      method: "GET",
      url,
      auth: {
        artifacts: user,
        credentials: {},
        strategy: "simple",
      },
    });

    expect(JSON.parse(res.payload)).toBeFalsy();
  });

  test("lat, lngがない場合はfalseを返す", async () => {
    const user = await createUserWithRelatedData({
      lat: null,
      lng: null,
    });

    const res = await server.inject({
      method: "GET",
      url,
      auth: {
        artifacts: user,
        credentials: {},
        strategy: "simple",
      },
    });

    expect(JSON.parse(res.payload)).toBeFalsy();
  });

  test("プライベートゾーンにいる(inPrivateZoneがtrue)場合、falseを返す", async () => {
    const user = await createUserWithRelatedData({
      inPrivateZone: true,
    });

    const res = await server.inject({
      method: "GET",
      url,
      auth: {
        artifacts: user,
        credentials: {},
        strategy: "simple",
      },
    });

    expect(JSON.parse(res.payload)).toBeFalsy();
  });
});
