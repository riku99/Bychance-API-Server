import { lineLoginPath, sessionLoginPath } from "~/routes/sessions";

export const createClient = {
  posts: true,
  flashes: true,
  senderTalkRooms: true,
  recipientTalkRooms: true,
  talkRoomMessages: true,
  readTalkRoomMessages: true,
};

export const sessionsInclude = (path: string) => {
  if (path === sessionLoginPath) {
    return createClient;
  }
};
