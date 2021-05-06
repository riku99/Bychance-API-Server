import Hapi from "@hapi/hapi";

import { readTalkRoomMessagesRoute } from "~/routes/readTalkRoomMessages";

export const readTalkRoomMessagesPlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/readTalkRoomMessages",
  register: readTalkRoomMessagesRoute,
};
