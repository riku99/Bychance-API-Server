import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createUser } from "../../data/user";
import { prisma } from "../../lib/prisma";

const url = `${baseUrl}/users/locations`;

const deleteData = async () => {
  await prisma.user.deleteMany();
};

describe("位置情報を削除する, DELETE /users/locations", () => {
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

  test("ユーザーの位置情報が削除される", async () => {
    const user = await createUser();

    await server.inject({
      method: "DELETE",
      url,
      auth: {
        credentials: {},
        strategy: "simple",
        artifacts: user,
      },
    });

    const deletedLocationUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    expect(deletedLocationUser?.lat).toBeNull();
    expect(deletedLocationUser?.lng).toBeNull();
    expect(deletedLocationUser?.geohash).toBeNull();
    expect(deletedLocationUser?.geohash7).toBeNull();
    expect(deletedLocationUser?.inPrivateZone).toBeFalsy();
  });
});
