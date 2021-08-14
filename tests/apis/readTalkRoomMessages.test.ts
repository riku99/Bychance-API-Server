import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createUser } from "../data/user";
import { resetDatabase } from "../helpers";

const prisma = new PrismaClient();

describe("readTalkRoomMessages", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
    jest.setTimeout(50000);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await server.stop();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  describe("POST baseUrl/talk_rooms/talkRoomId/messages/read", () => {
    test("データを作成し200を返す", async () => {
      const sender = await createUser();
      const recipient = await prisma.user.create({
        data: {
          id: "recip",
          accessToken: "rfemlkemrfn",
          lineId: "ejfieruhfuiehriu",
          name: "user2",
        },
      });

      const talkRoom = await prisma.talkRoom.create({
        data: {
          senderId: sender.id,
          recipientId: recipient.id,
        },
      });

      const id1 = 1;
      const id2 = 2;
      await prisma.talkRoomMessage.createMany({
        data: [
          {
            id: id1,
            roomId: talkRoom.id,
            userId: sender.id,
            text: "text",
          },
          {
            id: id2,
            roomId: talkRoom.id,
            userId: sender.id,
            text: "text2",
          },
        ],
      });

      const initialLength = await (await prisma.readTalkRoomMessage.findMany())
        .length;
      expect(initialLength).toEqual(0); // 何も作成されてないことを保証

      const res = await server.inject({
        method: "POST",
        url: `${baseUrl}/talk_rooms/${talkRoom.id}/messages/read`,
        payload: {
          ids: [id1, id2],
        },
        auth: {
          strategy: "simple",
          artifacts: recipient,
          credentials: {},
        },
      });

      const result = await prisma.readTalkRoomMessage.findMany();

      expect(res.statusCode).toEqual(200);
      expect(result.length).toEqual(2);
    });
  });
});
