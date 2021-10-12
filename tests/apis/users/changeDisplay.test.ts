import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createUser } from "../../data/user";
import { prisma } from "../../lib/prisma";

const deleteData = async () => {
  await prisma.user.deleteMany();
};

const url = `${baseUrl}/users/display`;

describe("Userのdisplayを変更, PUT /users/display", () => {
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

  test("payloadに指定したデータにdisplayが変更される", async () => {
    const user = await createUser({
      display: true,
    });

    await server.inject({
      method: "PUT",
      url,
      payload: {
        display: false,
      },
      auth: {
        strategy: "simple",
        artifacts: user,
        credentials: {},
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    expect(updatedUser?.display).toBeFalsy();
  });
});
