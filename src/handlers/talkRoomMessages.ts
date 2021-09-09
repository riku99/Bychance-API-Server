import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import {
  CreateTalkRoomMessagePayload,
  CreateParams,
  GetsParams,
} from "~/routes/talkRoomMessages/validator";
import { talkRoomMessageNameSpace } from "~/server";
import { throwInvalidError } from "~/helpers/errors";
import { pushNotificationToMany } from "~/helpers/pushNotification";
import { IotData } from "aws-sdk";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateTalkRoomMessagePayload;
  const params = req.params as CreateParams;
  const talkRoomId = Number(params.talkRoomId);

  const blcokPartner = await prisma.block.findUnique({
    where: {
      blockBy_blockTo: {
        blockBy: user.id,
        blockTo: payload.partnerId,
      },
    },
  });

  // メッセージを送った側が相手をブロックしている場合何もしないでエラー返す
  if (blcokPartner) {
    return throwInvalidError("このユーザーをブロックしています");
  }

  const talkRoom = await prisma.talkRoom.findFirst({
    where: {
      id: talkRoomId,
      OR: [
        {
          senderId: user.id,
          recipientId: payload.partnerId,
        },
        {
          recipientId: user.id,
          senderId: payload.partnerId,
        },
      ],
    },
    select: {
      id: true,
      updatedAt: true,
      messages: {
        // 送信相手から見てそのトークルームのメッセージが存在するか。具体的には送信したメッセージまたは受け取ったメッセージが存在するか
        where: {
          OR: [
            {
              userId: payload.partnerId,
            },
            {
              userId: {
                not: user.id,
              },
              receipt: true,
            },
          ],
        },
      },
      recipient: {
        include: {
          deviceToken: true,
          blocks: {
            where: {
              blockBy: payload.partnerId,
              blockTo: user.id,
            },
          },
        },
      },
      sender: {
        include: {
          deviceToken: true,
          blocks: {
            where: {
              blockBy: payload.partnerId,
              blockTo: user.id,
            },
          },
        },
      },
    },
  });

  // 既にルームが削除されていた場合はその時点でリターン。メッセージのデータも作成しなくて良い
  if (!talkRoom) {
    return {
      talkRoomPrecence: false,
      talkRoomId,
    };
  }

  const partner =
    talkRoom.sender.id === payload.partnerId
      ? talkRoom.sender
      : talkRoom.recipient;

  // 送信した側のユーザーが相手にブロックされているかどうか
  const blockedByPartner = await prisma.block.findUnique({
    where: {
      blockBy_blockTo: {
        blockBy: payload.partnerId,
        blockTo: user.id,
      },
    },
  });

  const message = await prisma.talkRoomMessage.create({
    data: {
      userId: user.id,
      roomId: talkRoomId,
      text: payload.text,
      receipt: blockedByPartner ? false : partner.talkRoomMessageReceipt, // 送信した側のユーザーが相手にブロックされていた場合相手には届けない。送信相手のtalkRoomMessageReceiptがfalseなら「受け取られない」という意味でfalse
    },
    select: {
      id: true,
      userId: true,
      roomId: true,
      text: true,
      createdAt: true,
    },
  });

  // メッセージを受け取らない設定にしている or 送信相手がログアウト中 or 相手にブロックされている場合はこの時点でリターン。push通知もsocketのイベントも起こさない
  if (!partner.talkRoomMessageReceipt || !partner.login || blockedByPartner) {
    return {
      talkRoomPrecence: true,
      message,
    };
  }

  const ioData = {
    message,
    sender: {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
    },
    show: partner.showReceiveMessage,
  };

  talkRoomMessageNameSpace
    .to(payload.partnerId)
    .emit("recieveTalkRoomMessage", ioData);

  const deviceTokens = partner.deviceToken.map((data) => data.token);
  pushNotificationToMany({
    tokens: deviceTokens,
    notification: {
      title: "メッセージが届きました",
    },
    data: {
      type: "talkRoomMessages",
      talkRoomId: String(talkRoomId),
      partnerId: user.id, // 送信相手から見たパートナー(リクエストしたユーザー)
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

  return {
    talkRoomPrecence: true,
    message,
  };
};

const gets = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const params = req.params as GetsParams;
  const talkRoomId = Number(params.talkRoomId);

  const talkRoom = await prisma.talkRoom.findFirst({
    where: {
      id: talkRoomId,
      OR: [
        {
          senderId: user.id,
        },
        {
          recipientId: user.id,
        },
      ],
    },
    select: {
      messages: {
        where: {
          OR: [
            {
              userId: user.id,
            },
            {
              userId: {
                not: user.id,
              },
              receipt: true,
            },
          ],
        },
        select: {
          id: true,
          userId: true,
          text: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!talkRoom) {
    return {
      roomPresence: false,
      messages: [],
    };
  }

  return {
    roomPresence: true,
    messages: talkRoom.messages,
  };
};

export const handlers = {
  create,
  gets,
};
