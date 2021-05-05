const forCreateClient = {
  posts: true,
  flashes: true,
  senderTalkRooms: {
    include: {
      // TalkRoomにはsenderとrecipientの2つのユーザーデータが保存されている。相手のデータを取得したいのでsenedrのリレーションでTalkRoomを取得した場合はrecipientをincludeする
      recipient: {
        include: { posts: true, flashes: true },
      },
    },
  },
  recipientTalkRooms: {
    include: {
      sender: {
        include: { posts: true, flashes: true },
      },
    },
  },
  talkRoomMessages: true,
  readTalkRoomMessages: true,
  viewedFlashes: true,
};

export const userIncludes = {
  forCreateClient,
};
