import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { CreateReadTalkRoomMessaagePayload } from "~/routes/readTalkRoomMessages/validator";

const prisma = new PrismaClient();

const createReadTalkRoomMessage = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateReadTalkRoomMessaagePayload;

  const partnerMessages = await prisma.talkRoomMessage.findMany({
    where: {
      roomId: payload.talkRoomId,
      userId: payload.partnerId, // 自分のメッセージではなくて相手のメッセージが必要
    },
    skip: 0,
    take: -payload.unreadNumber, // 未読分を取り出す。後ろから(新しいものから)とり出したいのでマイナスつける
  });

  const promise: Promise<any>[] = [];

  // forEachでasync/await使えないっぽいのでpromiseを配列に入れて下のPromise.allで処理する https://itnext.io/why-async-await-in-a-foreach-is-not-working-5f13118f90d
  partnerMessages.forEach((message) => {
    promise.push(
      prisma.readTalkRoomMessage.create({
        data: {
          userId: user.id,
          roomId: payload.talkRoomId,
          messageId: message.id,
        },
      })
    );
  });

  await Promise.all(promise);

  return h.response().code(200);
};

export const readTalkRoomMessageHandler = {
  createReadTalkRoomMessage,
};
