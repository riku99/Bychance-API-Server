import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { CreateTalkRoomMessagePayload } from "~/routes/talkRoomMessages/validator";
import { serializeTalkRoomMessage } from "~/serializers/talkRoomMessage";
import { serializeTalkRoom } from "~/serializers/talkRoom";
import { io } from "~/server";
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

  // トーク相手がルームを削除していた場合はその時点でリターン。(ioでプッシュしない)
  if (deletedTalkRoom) {
    return clientMessage;
  }

  let sendData: any; // push通知(io使う場合はioでも)でのpayloadに使う

  if (!payload.isFirstMessage) {
    const sender = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!sender) {
      return throwInvalidError();
    }

    sendData = {
      isFirstMessage: false,
      roomId: payload.talkRoomId,
      message: clientMessage,
      sender: {
        avatar: sender.avatar,
        name: sender.name,
      },
    };

    const ioData = {
      isFirstMessage: false,
      roomId: payload.talkRoomId,
      message: clientMessage,
      sender: {
        avatar: sender.avatar,
        name: sender.name,
      },
    };
    // トークルームが新規のものでなく既に存在している場合はメッセージのみをwsで送れば良い
    io.to(payload.partnerId).emit("recieveTalkRoomMessage", ioData);
    //return clientMessage;
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

    sendData = {
      isFirstMessage: true,
      room: serializeTalkRoom({
        talkRoom: restRoomData,
        talkRoomMessages: messages,
        readTalkRoomMessages,
        userId: payload.partnerId,
      }),
      sender: createAnotherUser({
        user: restSenderData,
        posts,
        flashes,
        viewedFlashes,
      }),
      message: clientMessage,
    };

    const ioData = {
      isFirstMessage: true,
      room: serializeTalkRoom({
        talkRoom: restRoomData,
        talkRoomMessages: messages,
        readTalkRoomMessages,
        userId: payload.partnerId,
      }),
      sender: createAnotherUser({
        user: restSenderData,
        posts,
        flashes,
        viewedFlashes,
      }),
      message: clientMessage,
    };

    // トークルームが新規のものの場合は相手にメッセージ + トークルームと送信したユーザーのデータも送る
    io.to(payload.partnerId).emit("recieveTalkRoomMessage", ioData);

    //return clientMessage;
  }

  // push通知のためのトークンを取得
  const tokenData = await prisma.deviceToken.findMany({
    where: {
      userId: payload.partnerId,
    },
  });
  const tokens = tokenData.map((t) => t.token);

  // 通知先のユーザー自体は1人だが、複数のデバイスがあるかつ今後複数人にする可能性もあるのでtoMany
  pushNotificationToMany({
    tokens,
    notification: {
      title: "メッセージが届きました",
    },
    apns: {
      payload: {
        aps: {
          contentAvailable: true, // これつけないとネイティブ側のsetBackgroundMessageHandlerが発火しない
        },
        ...sendData,
      },
    },
  });

  return clientMessage;
};

export const talkRoomMessagesHandler = {
  createTalkRoomMessage,
};
