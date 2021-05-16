import { Prisma } from "@prisma/client";

const forCreateClient = {
  posts: {
    orderBy: {
      createdAt: "desc" as const,
    },
  },
  flashes: true,
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
          posts: {
            orderBy: {
              createdAt: "desc" as const,
            },
          },
          flashes: true,
        },
      },
    },
  },
  recipientTalkRooms: {
    include: {
      messages: true,
      sender: {
        include: {
          posts: {
            orderBy: {
              createdAt: "desc" as const,
            },
          },
          flashes: true,
        },
      },
    },
  },
  deleteTalkRooms: {
    include: {
      // 削除したルームの相手ユーザーを知りたい関係からtalkRoomをインクルード。DeleteTalkRoomにpartnerIdを含めるのでもいいが、スケール難しくなりそうなのでいったんこのやり方でやる
      talkRoom: true,
    },
  },
};

export const userIncludes = {
  forCreateClient,
};
