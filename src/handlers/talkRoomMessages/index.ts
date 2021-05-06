import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { CreateTalkRoomMessagePayload } from "~/routes/talkRoomMessages/validator";
import { serializeTalkRoomMessage } from "~/serializers/talkRoomMessage";
import { serializeTalkRoom } from "~/serializers/talkRoom";
import { io } from "~/server";
import { throwInvalidError } from "~/helpers/errors";
import { createAnotherUser } from "~/helpers/anotherUser";

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

  if (!payload.isFirstMessage) {
    const sender = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!sender) {
      return throwInvalidError();
    }

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
    return clientMessage;
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

    return clientMessage;
  }
};

export const talkRoomMessagesHandler = {
  createTalkRoomMessage,
};
