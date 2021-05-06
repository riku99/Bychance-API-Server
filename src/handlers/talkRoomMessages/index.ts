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

  const sender = await prisma.user.findUnique({
    where: { id: user.id },
    include: { posts: true, flashes: true, viewedFlashes: true },
  });

  if (!sender) {
    return throwInvalidError("ユーザーが存在しません");
  }

  const { posts, flashes, viewedFlashes, ...restSenderData } = sender;

  const clientMessage = serializeTalkRoomMessage({ talkRoomMessage });

  const ioData = {
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

  //io.to(payload.partnerId).emit("recieveTalkRoomMessage", ioData); // 相手にメッセージの送信

  return clientMessage;
};

export const talkRoomMessagesHandler = {
  createTalkRoomMessage,
};
