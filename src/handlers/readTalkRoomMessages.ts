import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { throwInvalidError } from "~/helpers/errors";
import {
  CreatePayload,
  CreateParams,
} from "~/routes/readTalkRoomMessages/validator";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const payload = req.payload as CreatePayload;
  const params = req.params as CreateParams;
  const user = req.auth.artifacts as Artifacts;

  const room = await prisma.talkRoom.findFirst({
    where: {
      id: Number(params.talkRoomId),
      OR: [
        {
          senderId: user.id,
        },
        {
          recipientId: user.id,
        },
      ],
    },
  });

  if (!room) {
    return throwInvalidError();
  }

  const data = payload.ids.map((d) => ({
    userId: user.id,
    roomId: Number(params.talkRoomId),
    messageId: d,
  }));

  try {
    await prisma.readTalkRoomMessage.createMany({
      data,
    });
  } catch (e) {}

  return h.response().code(200);
};

export const handlers = {
  create,
};

// const createReadTalkRoomMessage = async (
//   req: Hapi.Request,
//   h: Hapi.ResponseToolkit
// ) => {
//   const user = req.auth.artifacts as Artifacts;
//   const payload = req.payload as CreateReadTalkRoomMessaagePayload;

//   const partnerMessages = await prisma.talkRoomMessage.findMany({
//     where: {
//       roomId: payload.talkRoomId,
//       userId: payload.partnerId, // 自分のメッセージではなくて相手のメッセージが必要
//     },
//     include: {
//       readTalkRoomMessages: true, // 既に既読データが存在するか確かめる。存在する場合は再度作らない。ただ、このやり方だとmessageIdに依存しており、1対1のやり取りなら問題ないが、複数人のやり取りになると問題が出るので注意
//     },
//     skip: 0,
//     take: -payload.unreadNumber, // 未読分を取り出す。後ろから(新しいものから)とり出したいのでマイナスつける
//   });

//   const promise: Promise<any>[] = [];

//   // forEachでasync/await使えないっぽいのでpromiseを配列に入れて下のPromise.allで処理する https://itnext.io/why-async-await-in-a-foreach-is-not-working-5f13118f90d
//   partnerMessages.forEach((message) => {
//     if (!message.readTalkRoomMessages.length) {
//       promise.push(
//         prisma.readTalkRoomMessage.create({
//           data: {
//             userId: user.id,
//             roomId: payload.talkRoomId,
//             messageId: message.id,
//           },
//         })
//       );
//     }
//   });

//   await Promise.all(promise);

//   return h.response().code(200);
// };
