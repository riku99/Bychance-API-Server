import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createUser } from "../../data/user";
import { prisma } from "../../lib/prisma";

const deleteData = async () => {
  await prisma.user.deleteMany();
};

const url = `${baseUrl}/users/talk_room_messages_receipt`;

describe("UserのtalkRoomMessageRecieptを変更, PUT users/talk_room_messages_receipt", () => {
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

  test("talkRoomMessageRecieptがfalse -> trueに変更される", async () => {
    const user = await createUser({
      talkRoomMessageReceipt: false,
    });

    await server.inject({
      method: "PUT",
      url,
      auth: {
        strategy: "simple",
        artifacts: user,
        credentials: {},
      },
      payload: {
        receipt: true,
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    expect(updatedUser?.talkRoomMessageReceipt).toBeTruthy();
  });
});
