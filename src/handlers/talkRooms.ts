import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { throwInvalidError } from "~/helpers/errors";
import {
  CreateTalkRoomPayload,
  DeleteTalkRoomParams,
  GetParams,
} from "~/routes/talkRooms/validator";

const prisma = new PrismaClient();

const createTalkRoom = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateTalkRoomPayload;

  const talkRooms = await prisma.talkRoom.findMany({
    where: {
      OR: [
        {
          senderId: user.id,
          recipientId: payload.partnerId,
        },
        {
          senderId: payload.partnerId,
          recipientId: user.id,
        },
      ],
    },
  });

  const existingTalkRoom = talkRooms.length ? talkRooms[0] : null;
  if (existingTalkRoom) {
    return {
      presence: true,
      roomId: existingTalkRoom.id,
      timestamp: existingTalkRoom.updatedAt.toString(),
    };
  }

  const newTalkRoom = await prisma.talkRoom.create({
    data: {
      senderId: user.id,
      recipientId: payload.partnerId,
    },
  });

  return {
    presence: false,
    roomId: newTalkRoom.id,
    timestamp: newTalkRoom.createdAt.toString(),
  };
};

const deleteTalkRoom = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const params = req.params as DeleteTalkRoomParams;

  await prisma.readTalkRoomMessage.deleteMany({
    where: {
      roomId: params.talkRoomId,
    },
  });

  await prisma.talkRoomMessage.deleteMany({
    where: {
      roomId: params.talkRoomId,
    },
  });

  // トークルームを削除しようとした時点で相手がその前に削除していた場合このprismaによるdeletrはエラーになる。なのでtryでエスケープする
  try {
    await prisma.talkRoom.delete({
      where: {
        id: params.talkRoomId,
      },
    });
  } catch {}

  return h.response().code(200);
};

const get = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const params = req.params as GetParams;

  if (user.id !== params.userId) return throwInvalidError();

  const talkRoomData = await prisma.talkRoom.findMany({
    where: {
      OR: [
        {
          senderId: params.userId,
          messages: {
            some: {}, // こうすることで、「少なくとも1つのmessagesが存在する ~ 」というフィルタリングができる https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries
          },
        },
        {
          recipientId: params.userId,
          messages: {
            some: {
              receipt: true,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      updatedAt: true,
      unreadMessages: {
        where: {
          userId: {
            not: params.userId,
          },
          receipt: true,
          readTalkRoomMessages: {
            none: {
              userId: params.userId,
            },
          },
        },
        select: {
          id: true,
        },
      },
      lastMessage: {
        where: {
          OR: [
            {
              userId: params.userId,
            },
            {
              userId: {
                not: params.userId,
              },
              receipt: true,
            },
          ],
        },
        // orderByとtakeの組み合わせで1番最近のデータとる
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          text: true,
        },
      },
      sender: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      recipient: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  return talkRoomData;
};

export const handlers = {
  createTalkRoom,
  deleteTalkRoom,
  get,
};
