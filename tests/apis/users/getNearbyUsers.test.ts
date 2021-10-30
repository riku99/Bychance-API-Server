import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { prisma } from "../../lib/prisma";
import { createUser } from "../../data/user";
import { locations } from "../../data/locations";
import { createPrivateTime } from "../../data/privateTime";
import { createBlock } from "../../data/block";
import { createGroup } from "../../data/groups";

const url = `${baseUrl}/users/nearby`;

const deleteData = async () => {
  await prisma.block.deleteMany();
  await prisma.privateTime.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();
};

describe("近くにいるユーザーの取得, GET /users/nearby", () => {
  let server: Hapi.Server;

  const shibyaStation = locations["渋谷駅"];
  const sinjukuStation = locations["新宿駅"];

  beforeAll(async () => {
    server = await initializeServer();
  });

  beforeEach(async () => {
    await deleteData();
  });

  afterAll(async () => {
    await deleteData();
  });

  test("近くにいるユーザーの取得", async () => {
    const requestUser = await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
    });
    await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
      display: true, // displayはデフォルトはfalseなので明示的にtrueにする
    });
    await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
      display: true,
    });

    const res = await server.inject({
      method: "GET",
      url: `${url}?range=0.5&id=${requestUser.id}`,
      auth: {
        credentials: {},
        strategy: "simple",
        artifacts: requestUser,
      },
    });

    const data = JSON.parse(res.payload);
    expect(res.statusCode).toEqual(200);
    expect(data.length).toEqual(2);
  });

  test("displayがfalseのユーザーの場合は取得しない", async () => {
    const requestUser = await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
    });
    await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
      display: false, // displayをfalseにする
    });
    await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
      display: true,
    });

    const res = await server.inject({
      method: "GET",
      url: `${url}?range=0.5&id=${requestUser.id}`,
      auth: {
        credentials: {},
        strategy: "simple",
        artifacts: requestUser,
      },
    });

    const data = JSON.parse(res.payload);
    expect(res.statusCode).toEqual(200);
    expect(data.length).toEqual(1);
  });

  test("プライベートゾーンにいる(inPrivateZoneがtrue)ユーザーがいる場合、そのユーザーは取得しない", async () => {
    const requestUser = await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
    });

    await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
      display: true,
      inPrivateZone: true, // inPrivateZoneをtrueで作成
    });

    await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
      display: true,
    });

    const res = await server.inject({
      method: "GET",
      url: `${url}?range=0.5&id=${requestUser.id}`,
      auth: {
        credentials: {},
        strategy: "simple",
        artifacts: requestUser,
      },
    });

    const data = JSON.parse(res.payload);
    expect(res.statusCode).toEqual(200);
    expect(data.length).toEqual(1);
  });

  test("プライベートタイム中のユーザーがいる場合、そのユーザーは取得しない", async () => {
    const requestUser = await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
    });

    const user1 = await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
      display: true,
    });

    await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
      display: true,
    });

    const date = new Date();

    // user1のプライベートタイムの作成
    // テスト実行時の1時間前から3時間後までを登録
    await createPrivateTime({
      userId: user1.id,
      startHours: date.getHours() - 1,
      startMinutes: date.getMinutes(),
      endHours: date.getHours() + 3,
      endMinutes: date.getMinutes(),
    });

    const res = await server.inject({
      method: "GET",
      url: `${url}?range=0.5&id=${requestUser.id}`,
      auth: {
        credentials: {},
        strategy: "simple",
        artifacts: requestUser,
      },
    });

    const data = JSON.parse(res.payload);
    expect(res.statusCode).toEqual(200);
    expect(data.length).toEqual(1);
  });

  test("ブロックしているユーザーがいる場合、そのユーザーは取得しない", async () => {
    const requestUser = await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
    });

    const user1 = await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
      display: true,
    });

    const user2 = await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
      display: true,
    });

    // requestUserがuser1をブロックしている
    await createBlock({
      blockBy: requestUser.id,
      blockTo: user1.id,
    });

    const res = await server.inject({
      method: "GET",
      url: `${url}?range=0.5&id=${requestUser.id}`,
      auth: {
        credentials: {},
        strategy: "simple",
        artifacts: requestUser,
      },
    });

    const data = JSON.parse(res.payload);
    expect(res.statusCode).toEqual(200);
    expect(data.length).toEqual(1);
    expect(data[0].id).toEqual(user2.id); // 取得した1つのデータはuser2のデータであることを保証
  });

  test("ブロックされているユーザーがいる場合、そのユーザーは取得しない", async () => {
    const requestUser = await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
    });

    const user1 = await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
      display: true,
    });

    const user2 = await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
      display: true,
    });

    // user1がrequestUserをブロックしている
    await createBlock({
      blockBy: user1.id,
      blockTo: requestUser.id,
    });

    const res = await server.inject({
      method: "GET",
      url: `${url}?range=0.5&id=${requestUser.id}`,
      auth: {
        credentials: {},
        strategy: "simple",
        artifacts: requestUser,
      },
    });

    const data = JSON.parse(res.payload);
    expect(res.statusCode).toEqual(200);
    expect(data.length).toEqual(1);
    expect(data[0].id).toEqual(user2.id); // 取得した1つのデータはuser2のデータであることを保証
  });

  test("user1のグループメンバーuser2がrequestUserをブロックしている場合、user1も取得しない", async () => {
    const requestUser = await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
    });

    const groupOwner = await createUser();

    const group = await createGroup({
      ownerId: groupOwner.id,
    });

    await prisma.user.update({
      where: {
        id: groupOwner.id,
      },
      data: {
        groupId: group.id,
      },
    });

    const user1 = await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
      display: true,
      groupId: group.id,
    });

    const user2 = await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
      display: true,
      groupId: group.id,
    });

    // user2がrequestUserをブロック
    await createBlock({
      blockBy: user2.id,
      blockTo: requestUser.id,
    });

    const res = await server.inject({
      method: "GET",
      url: `${url}?range=0.5&id=${requestUser.id}`,
      auth: {
        credentials: {},
        strategy: "simple",
        artifacts: requestUser,
      },
    });

    const data = JSON.parse(res.payload);
    expect(res.statusCode).toEqual(200);
    // user1はrequestUserをブロックしていないが、グループメンバーであるuser2がrequestUserをブロックしているのでuser1も取得しない
    expect(data.length).toEqual(0);
  });

  test("指定した範囲の外にいるユーザーは取得しない", async () => {
    const requestUser = await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
    });

    const user1 = await createUser({
      geohash: shibyaStation.hashedGH,
      lat: shibyaStation.cryptoLat,
      lng: shibyaStation.cryptoLng,
      display: true,
    });

    // user2の位置情報は新宿駅に設定
    const user2 = await createUser({
      geohash: sinjukuStation.hashedGH,
      lat: sinjukuStation.cryptoLat,
      lng: sinjukuStation.cryptoLng,
      display: true,
    });

    const res = await server.inject({
      method: "GET",
      url: `${url}?range=0.5&id=${requestUser.id}`,
      auth: {
        credentials: {},
        strategy: "simple",
        artifacts: requestUser,
      },
    });

    const data = JSON.parse(res.payload);
    expect(res.statusCode).toEqual(200);
    expect(data.length).toEqual(1);
    expect(data[0].id).toEqual(user1.id);
  });
});
