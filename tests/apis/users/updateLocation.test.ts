import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createUser } from "../../data/user";
import { prisma } from "../../lib/prisma";

const url = `${baseUrl}/users/locations`;

const deleteData = async () => {
  await prisma.user.deleteMany();
};

describe("位置情報の更新, PATCH /users/locaitons", () => {
  let server: Hapi.Server;
  let spy: jest.SpyInstance;

  beforeAll(async () => {
    server = await initializeServer();
  });

  afterEach(() => {
    if (spy) {
      spy.mockRestore();
    }
  });

  beforeEach(async () => {
    await deleteData();
  });

  afterAll(async () => {
    await deleteData();
  });

  test("ユーザーの位置情報が更新される", async () => {
    const cryptoLat = "lat";
    const cryptoLng = "lng";
    const cryptoModules = require("~/helpers/crypto");
    spy = jest
      .spyOn(cryptoModules, "handleUserLocationCrypto")
      .mockReturnValue({
        lat: cryptoLat,
        lng: cryptoLng,
      });

    const user = await createUser();

    await server.inject({
      method: "PATCH",
      url,
      payload: {
        lat: 10,
        lng: 10,
      },
      auth: {
        strategy: "simple",
        credentials: {},
        artifacts: user,
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    expect(updatedUser?.lat).toEqual(cryptoLat);
    expect(updatedUser?.lng).toEqual(cryptoLng);
  });
});
