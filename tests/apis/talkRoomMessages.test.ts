import Hapi from "@hapi/hapi";
import { PrismaClient, User as UserType, TalkRoom } from "@prisma/client";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createHash } from "~/helpers/crypto";
import { resetDatabase } from "../helpers";
import { createUser, User, createRamdomUser } from "../data/user";
import { user } from "../data";

const prisma = new PrismaClient();

describe("talkRoomMessages", () => {
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

  describe("GET baseUrl/talk_rooms/{talkRoomId}/messages", () => {
    let user1: UserType;
    let user2: UserType;
    let user3: UserType;
    let talkRoom1: TalkRoom;

    beforeEach(async () => {
      user1 = await createRamdomUser();
      user2 = await createRamdomUser();
      user3 = await createRamdomUser();
      talkRoom1 = await prisma.talkRoom.create({
        data: {
          senderId: user1.id,
          recipientId: user2.id,
        },
      });
    });

    test("メッセージデータを返す", async () => {
      // const talkRoom1 = await prisma.talkRoom.create({
      //   data: {
      //     senderId: user1.id,
      //     recipientId: user2.id,
      //   },
      // });

      const talkRoom2 = await prisma.talkRoom.create({
        data: {
          senderId: user2.id,
          recipientId: user3.id,
        },
      });

      // talkRoom1のメッセージデータを2つ作成
      await prisma.talkRoomMessage.createMany({
        data: [
          {
            roomId: talkRoom1.id,
            userId: user1.id,
            text: "Hello",
          },
          {
            roomId: talkRoom1.id,
            userId: user1.id,
            text: "Hi!",
          },
        ],
      });

      // 対象のルームではないルームに属するメッセージを1つ作成
      await prisma.talkRoomMessage.create({
        data: {
          roomId: talkRoom2.id,
          userId: user2.id,
          text: "OK",
        },
      });

      const res = await server.inject({
        method: "GET",
        url: `${baseUrl}/talk_rooms/${talkRoom1.id}/messages`,
        auth: {
          strategy: "simple",
          artifacts: user1,
          credentials: {},
        },
      });

      expect(res.statusCode).toEqual(200);
      expect(JSON.parse(res.payload).messages.length).toEqual(2); // talkRoom1に属するデータ2つのみを取得
    });

    describe("指定したトークルームとユーザーの関連がない", () => {
      test("400を返す", async () => {
        // const talkRoom1 = await prisma.talkRoom.create({
        //   data: {
        //     senderId: user1.id,
        //     recipientId: user2.id,
        //   },
        // });

        const res = await server.inject({
          method: "GET",
          url: `${baseUrl}/talk_rooms/${talkRoom1.id}/messages`,
          auth: {
            strategy: "simple",
            artifacts: user3, // 認可から取得したユーザーがtalkRoom1と関係してない
            credentials: {},
          },
        });

        expect(res.statusCode).toEqual(400);
      });
    });

    describe("受け取らなかったメッセージが存在する", () => {
      test("受け取らなかったメッセージはレスポンスに含まれない", async () => {
        const message1 = await prisma.talkRoomMessage.create({
          data: {
            roomId: talkRoom1.id,
            userId: user1.id,
            text: "おは！",
          },
        });
        const message2 = await prisma.talkRoomMessage.create({
          data: {
            roomId: talkRoom1.id,
            userId: user1.id,
            text: "おはよ！",
            receipt: false, // 受け取られなかったメッセージ
          },
        });

        const res = await server.inject({
          method: "GET",
          url: `${baseUrl}/talk_rooms/${talkRoom1.id}/messages`,
          auth: {
            strategy: "simple",
            artifacts: user2, // メッセージを送られた側のリクエストで検証するためuser2
            credentials: {},
          },
        });

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload).messages.length).toEqual(1);
      });
    });
  });

  // describe("POST /talkRoomMessages", () => {
  //   const successfulRequestSchema = {
  //     method: "POST",
  //     url: `${baseUrl}/talkRoomMessages?id=${user.id}`,
  //     payload: { talkRoomId: 1, text: "Hey!!", partnerId: "2" },
  //     headers: { Authorization: `Bearer ${accessToken}` },
  //   };

  //   describe("バリデーションに通る", () => {
  //     test("TalkRoomMessageが作成され200を返す", async () => {
  //       await prisma.user.deleteMany({});
  //       await prisma.user.create({ data: user });
  //       await prisma.user.create({ data: user2 });
  //       await prisma.talkRoom.create({ data: talkRoom });

  //       const res = await server.inject(successfulRequestSchema);

  //       expect(res.statusCode).toEqual(200);

  //       const message = await prisma.talkRoomMessage.findMany({
  //         where: {
  //           userId: user.id,
  //         },
  //       });

  //       expect(message.length).toEqual(1);
  //     });
  //   });

  //   describe("バリデーションに引っかかる", () => {
  //     beforeEach(async () => {
  //       await prisma.talkRoomMessage.deleteMany({});
  //       await prisma.talkRoom.deleteMany({});
  //       await prisma.user.deleteMany({});
  //     });

  //     test("payloadに必要なデータがないので400を返す", async () => {
  //       await prisma.user.create({ data: user });

  //       const res = await server.inject({
  //         ...successfulRequestSchema,
  //         payload: {}, // paylodにデータなし
  //       });

  //       expect(res.statusCode).toEqual(400);
  //     });

  //     test("payloadに余計なデータがあるので400を返す", async () => {
  //       await prisma.user.create({ data: user });

  //       const res = await server.inject({
  //         ...successfulRequestSchema,
  //         payload: { ...successfulRequestSchema.payload, accessToken: "12234" }, // paylodにaccessTokenという余計なデータある
  //       });

  //       expect(res.statusCode).toEqual(400);
  //     });
  //   });
  // });
});
