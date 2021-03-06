import Hapi from "@hapi/hapi";
import { PrismaClient, User as UserType } from "@prisma/client";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createUser, User } from "../data/user";
import { resetDatabase } from "../helpers";

const prisma = new PrismaClient();

describe("talkRooms", () => {
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

  describe("GET baseUrl/users/userId/talk_rooms", () => {
    let sender: UserType;
    let recipient: UserType;
    let baseRequestShema: Hapi.ServerInjectOptions;
    let baseRecipientRequestShema: Hapi.ServerInjectOptions;

    beforeEach(async () => {
      sender = await createUser();
      recipient = await prisma.user.create({
        data: {
          ...User,
          id: "mkfernfire",
          lineId: "dfreufnreiu",
          accessToken: "mckemklfer",
        },
      });

      baseRequestShema = {
        method: "GET",
        url: `${baseUrl}/users/${sender.id}/talk_rooms`,
        auth: {
          strategy: "simple",
          artifacts: sender,
          credentials: {},
        },
      };

      baseRecipientRequestShema = {
        method: "GET",
        url: `${baseUrl}/users/${recipient.id}/talk_rooms`,
        auth: {
          strategy: "simple",
          artifacts: recipient,
          credentials: {},
        },
      };
    });

    test("トークルームデータを返す", async () => {
      const room = await prisma.talkRoom.create({
        data: {
          senderId: sender.id,
          recipientId: recipient.id,
        },
      });
      await prisma.talkRoomMessage.create({
        data: {
          userId: sender.id,
          roomId: room.id,
          text: "こんにちは!!",
        },
      });

      const res = await server.inject(baseRequestShema);

      expect(res.statusCode).toEqual(200);
      expect(JSON.parse(res.payload).length).toEqual(1);
    });

    describe("senderかrecipientかによるテスト", () => {
      describe("作成した側(sender)である", () => {
        describe("トークルームに一件もメッセージが存在しない", () => {
          test("トークルームはレスポンスに含まれない", async () => {
            await prisma.talkRoom.create({
              data: {
                senderId: sender.id,
                recipientId: recipient.id,
              },
            });

            // メッセージを作成しない

            const res = await server.inject(baseRequestShema);

            expect(res.statusCode).toEqual(200);
            expect(JSON.parse(res.payload).length).toEqual(0);
          });
        });
      });

      describe("受け取った側(recipient)である", () => {
        describe("メッセージ自体は存在するが、1件も受け取ったメッセージが存在しない(receipがtrueのデータがない)", () => {
          test("トークルームはレスポンスに含まれない", async () => {
            const room = await prisma.talkRoom.create({
              data: {
                senderId: sender.id,
                recipientId: recipient.id,
              },
            });

            await prisma.talkRoomMessage.create({
              data: {
                userId: sender.id,
                roomId: room.id,
                text: "Hello!!",
                receipt: false, // メッセージを作成したが受け取らなかった
              },
            });

            const res = await server.inject(baseRecipientRequestShema);

            expect(res.statusCode).toEqual(200);
            expect(JSON.parse(res.payload).length).toEqual(0);
          });
        });
      });
    });

    describe("未読データと最後のメッセージのテスト", () => {
      test("reciptがtrueのデータはレスポンスに含んでfalseのものは含めない", async () => {
        const talkRoom = await prisma.talkRoom.create({
          data: {
            senderId: sender.id,
            recipientId: recipient.id,
          },
        });
        const reciptMessage = await prisma.talkRoomMessage.create({
          data: {
            userId: sender.id,
            roomId: talkRoom.id,
            text: "Hey!",
            receipt: true, // こいつは受け取った
          },
        });
        const notReciptMessage = await prisma.talkRoomMessage.create({
          data: {
            userId: sender.id,
            roomId: talkRoom.id,
            text: "Hello!",
            receipt: false, // こいつは受け取らなかった
          },
        });

        const res = await server.inject(baseRecipientRequestShema);
        const data = JSON.parse(res.payload)[0];

        expect(res.statusCode).toEqual(200);
        expect(data.unreadMessages[0].id).toEqual(reciptMessage.id);
        expect(data.lastMessage[0].id).toEqual(reciptMessage.id);
      });
    });
  });

  // describe("POST /talkRooms", () => {
  //   const successfulRequestSchema = {
  //     method: "POST",
  //     url: `${baseUrl}/talkRooms?id=${user.id}`,
  //     payload: { partnerId: "2" },
  //     headers: { Authorization: `Bearer ${accessToken}` },
  //   };

  //   describe("バリデーションに通る", () => {
  //     describe("トークルームが既に存在する", () => {
  //       beforeEach(async () => {
  //         await prisma.talkRoom.deleteMany({});
  //         await prisma.user.deleteMany({});
  //       });

  //       test("作成されずに200を返す", async () => {
  //         await prisma.user.create({ data: user });
  //         await prisma.user.create({ data: user2 });
  //         await prisma.talkRoom.create({ data: talkRoom });

  //         const talkRooms = await prisma.talkRoom.findMany({
  //           where: {
  //             OR: [
  //               {
  //                 senderId: user.id,
  //                 recipientId: user2.id,
  //               },
  //               {
  //                 senderId: user2.id,
  //                 recipientId: user.id,
  //               },
  //             ],
  //           },
  //         });

  //         expect(talkRooms.length).toEqual(1); // 既にトークルームが存在していることを保証

  //         const res = await server.inject(successfulRequestSchema);

  //         expect(res.statusCode).toEqual(200);

  //         const afterRequestTalkRooms = await prisma.talkRoom.findMany({
  //           where: {
  //             OR: [
  //               {
  //                 senderId: user.id,
  //                 recipientId: user2.id,
  //               },
  //               {
  //                 senderId: user2.id,
  //                 recipientId: user.id,
  //               },
  //             ],
  //           },
  //         });

  //         expect(afterRequestTalkRooms.length).toEqual(1); // リクエストのあともデータが作成されていないことを検証
  //       });
  //     });

  //     describe("トークルームが新規である", () => {
  //       test("作成され200を返す", async () => {
  //         await prisma.talkRoom.deleteMany({});
  //         await prisma.user.deleteMany({});

  //         await prisma.user.create({ data: user });
  //         await prisma.user.create({ data: user2 });

  //         const talkRooms = await prisma.talkRoom.findMany({
  //           where: {
  //             OR: [
  //               {
  //                 senderId: user.id,
  //                 recipientId: user2.id,
  //               },
  //               {
  //                 senderId: user2.id,
  //                 recipientId: user.id,
  //               },
  //             ],
  //           },
  //         });

  //         expect(talkRooms.length).toEqual(0); // トークルームが存在しないことを保証

  //         const res = await server.inject(successfulRequestSchema);

  //         expect(res.statusCode).toEqual(200);

  //         const afterRequestTalkRooms = await prisma.talkRoom.findMany({
  //           where: {
  //             OR: [
  //               {
  //                 senderId: user.id,
  //                 recipientId: user2.id,
  //               },
  //               {
  //                 senderId: user2.id,
  //                 recipientId: user.id,
  //               },
  //             ],
  //           },
  //         });

  //         expect(afterRequestTalkRooms.length).toEqual(1); // リクエストの後はデータが作成されていることを検証
  //       });
  //     });
  //   });
  // });
});
