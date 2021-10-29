import Hapi from "@hapi/hapi";
import geohash from "ngeohash";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { prisma } from "../../lib/prisma";
import { createUser } from "../../data/user";
import { locations } from "../../data/locations";

const url = `${baseUrl}/users/nearby`;

const deleteData = async () => {
  await prisma.user.deleteMany();
};

describe("近くにいるユーザーの取得, GET /users/nearby", () => {
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

  test("近くにいるユーザーの取得", async () => {
    const shibyaStation = locations["渋谷駅"];

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
    const shibyaStation = locations["渋谷駅"];

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
    const shibyaStation = locations["渋谷駅"];

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

  test("プライベートタイム中のユーザーがいる場合、そのユーザーは取得しない", async () => {});

  test("ブロックしているユーザーがいる場合、そのユーザーは取得しない", async () => {});

  test("ブロックされているユーザーがいる場合、そのユーザーは取得しない", async () => {});

  test("とあるユーザーAのグループメンバーがリクエストユーザーBをブロックしている場合、ユーザーAは取得しない", async () => {});
});
