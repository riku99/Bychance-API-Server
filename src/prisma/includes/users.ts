const forCreateClient = {
  posts: true,
  flashes: true,
  senderTalkRooms: {
    include: {
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
