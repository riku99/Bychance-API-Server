import Hapi from "@hapi/hapi";
import { dbNow, prisma } from "~/lib/prisma";
import { Artifacts } from "~/auth/bearer";
import { throwInvalidError } from "~/helpers/errors";
import {
  CreateTalkRoomPayload,
  DeleteTalkRoomParams,
} from "~/routes/talkRooms/validator";

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

  const nowJST = dbNow();

  const newTalkRoom = await prisma.talkRoom.create({
    data: {
      senderId: user.id,
      recipientId: payload.partnerId,
      createdAt: nowJST,
      updatedAt: nowJST,
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

  if (user.id !== user.id) return throwInvalidError();

  const talkRoomData = await prisma.talkRoom.findMany({
    where: {
      OR: [
        {
          senderId: user.id,
          messages: {
            some: {}, // こうすることで、「少なくとも1つのmessagesが存在する ~ 」というフィルタリングができる https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries
          },
        },
        {
          recipientId: user.id,
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
            not: user.id, // 既読未読の対象は自分が送ったメッセージじゃないよね
          },
          receipt: true,
          readTalkRoomMessages: {
            none: {
              userId: user.id, // 既読データに存在しないものを取得したいよね
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
              userId: user.id,
            },
            {
              userId: {
                not: user.id,
              },
              receipt: true, // このルームの一番最近のメッセージが相手からのメッセージでも、そのreciptがfalseなら(受け取り拒否していたら)そのメッセージは取得しないよね
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
          userId: true,
          createdAt: true,
        },
      },
      sender: {
        select: {
          id: true,
          name: true,
          avatar: true,
          blocked: true,
        },
      },
      recipient: {
        select: {
          id: true,
          name: true,
          avatar: true,
          blocked: true,
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
