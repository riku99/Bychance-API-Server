import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { CreateTalkRoomMessagePayload } from "~/routes/talkRoomMessages/validator";
import { serializeTalkRoomMessage } from "~/serializers/talkRoomMessage";
import { serializeTalkRoom } from "~/serializers/talkRoom";
import { talkRoomMessageNameSpace } from "~/server";
import { throwInvalidError } from "~/helpers/errors";
import { createAnotherUser } from "~/helpers/anotherUser";
import { pushNotificationToMany } from "~/helpers/pushNotification";

const prisma = new PrismaClient();

const createTalkRoomMessage = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateTalkRoomMessagePayload;

  const talkRoomMessage = await prisma.talkRoomMessage.create({
    data: {
      userId: user.id,
      roomId: payload.talkRoomId,
      text: payload.text,
    },
  });
  const clientMessage = serializeTalkRoomMessage({ talkRoomMessage });

  const deletedTalkRoom = await prisma.deleteTalkRoom.findUnique({
    where: {
      userId_talkRoomId: {
        userId: payload.partnerId, // 相手がこのルームを削除したかどうかを知りたいのでpartnerのidを指定する
        talkRoomId: payload.talkRoomId,
      },
    },
  });

  // トーク相手がルームを削除していた場合はその時点でリターン。(ioもpush通知もしない)
  if (deletedTalkRoom) {
    return clientMessage;
  }

  let ioData: any;

  if (!payload.isFirstMessage) {
    const sender = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!sender) {
      return throwInvalidError();
    }

    // トークルームが新規のものでなく既に存在している場合はメッセージのみをwsで送れば良い
    ioData = {
      isFirstMessage: false,
      roomId: payload.talkRoomId,
      message: clientMessage,
      sender: {
        id: sender.id,
        avatar: sender.avatar,
        name: sender.name,
      },
    };
  } else {
    const sender = await prisma.user.findUnique({
      where: { id: user.id },
      include: { posts: true, flashes: true, viewedFlashes: true },
    });

    const room = await prisma.talkRoom.findUnique({
      where: { id: payload.talkRoomId },
      include: { messages: true },
    });

    if (!room) {
      return throwInvalidError();
    }

    const { messages, ...restRoomData } = room;

    const readTalkRoomMessages = await prisma.readTalkRoomMessage.findMany({
      where: {
        userId: payload.partnerId,
      },
    });

    if (!sender) {
      return throwInvalidError("ユーザーが存在しません");
    }

    const { posts, flashes, viewedFlashes, ...restSenderData } = sender;

    const serializeedRoom = serializeTalkRoom({
      talkRoom: restRoomData,
      talkRoomMessages: messages,
      readTalkRoomMessages,
      userId: payload.partnerId,
    });

    const clientSenderData = createAnotherUser({
      user: restSenderData,
      posts,
      flashes,
      viewedFlashes,
    });

    // トークルームが新規のものの場合は相手にメッセージ + トークルームと送信したユーザーのデータも送る
    ioData = {
      isFirstMessage: true,
      room: serializeedRoom,
      message: clientMessage,
      sender: clientSenderData,
    };
  }

  talkRoomMessageNameSpace
    .to(payload.partnerId)
    .emit("recieveTalkRoomMessage", ioData);

  const tokenData = await prisma.deviceToken.findMany({
    where: {
      userId: payload.partnerId,
    },
  });
  const tokens = tokenData.map((data) => data.token);

  pushNotificationToMany({
    tokens,
    notification: {
      title: "メッセージが届きました",
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          contentAvailable: true,
        },
      },
    },
  });

  return clientMessage;
};

export const talkRoomMessagesHandler = {
  createTalkRoomMessage,
};
