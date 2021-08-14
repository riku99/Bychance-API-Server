import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createHash } from "~/helpers/crypto";
import { createUser } from "../data/user";
import { talkRoomsPlugin } from "~/plugins/talkRooms";
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

  // describe("POST /readTalkRoomMessages", () => {
  //   const successfulRequestSchema = {
  //     method: "POST",
  //     url: `${baseUrl}/readTalkRoomMessages?id=${user.id}`,
  //     payload: { talkRoomId: 1, partnerId: "2", unreadNumber: 2 },
  //     headers: { Authorization: `Bearer ${accessToken}` },
  //   };

  //   describe("バリデーションに通る", () => {
  //     beforeEach(async () => {
  //       await prisma.readTalkRoomMessage.deleteMany({});
  //       await prisma.talkRoomMessage.deleteMany({});
  //       await prisma.talkRoom.deleteMany({});
  //     });
  //     test("データが作成されて200を返す", async () => {
  //       await prisma.talkRoom.create({ data: talkRoom });
  //       await prisma.talkRoomMessage.create({ data: talkRoomMessage });
  //       await prisma.talkRoomMessage.create({ data: talkRoomMessage2 });

  //       const beforeRequestData = await prisma.readTalkRoomMessage.findMany({});

  //       expect(beforeRequestData.length).toEqual(0);

  //       const res = await server.inject(successfulRequestSchema);

  //       expect(res.statusCode).toEqual(200);

  //       const data = await prisma.readTalkRoomMessage.findMany({});

  //       expect(data.length).toEqual(2);
  //     });
  //   });

  //   describe("バリデーションに引っかかる", () => {
  //     test("payloadに必要なデータがないので400を返す", async () => {
  //       const res = await server.inject({
  //         ...successfulRequestSchema,
  //         payload: {}, // payload空にする
  //       });

  //       expect(res.statusCode).toEqual(400);
  //     });

  //     test("payloadに余計なデータがるので400を返す", async () => {
  //       const res = await server.inject({
  //         ...successfulRequestSchema,
  //         payload: {
  //           ...successfulRequestSchema.payload,
  //           accessToken: "334040", // accessTokenぶち込む
  //         },
  //       });

  //       expect(res.statusCode).toEqual(400);
  //     });
  //   });
  // });
});
