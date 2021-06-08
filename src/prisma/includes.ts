import { Prisma } from "@prisma/client";

export const postIncludes = {
  posts: {
    orderBy: {
      createdAt: "desc" as const,
    },
  },
};

export const flashIncludes = {
  flashes: {
    include: {
      viewed: true,
      stamps: true,
    },
  },
};

export const createClientIncludes = {
  ...postIncludes,
  ...flashIncludes,
  talkRoomMessages: true,
  readTalkRoomMessages: true,
  viewedFlashes: true,
  senderTalkRooms: {
    include: {
      // 送信したのが自分でも他人でもこのトークルームに所属するメッセージは全て取得したいのでincludeにmessagesをつける
      messages: true,
      // TalkRoomにはsenderとrecipientの2つのユーザーデータが保存されている。相手のデータを取得したいのでsenedrのリレーションでTalkRoomを取得した場合はrecipientをincludeする
      recipient: {
        include: {
          ...postIncludes,
          ...flashIncludes,
        },
      },
    },
  },
  recipientTalkRooms: {
    include: {
      messages: true,
      sender: {
        include: {
          ...postIncludes,
          ...flashIncludes,
        },
      },
    },
  },
};
