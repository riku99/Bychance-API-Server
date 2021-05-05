import Hapi from "@hapi/hapi";

import { talkRoomMessagesRoute } from "~/routes/talkRoomMessages";

export const talkRoomMessagesPlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/talkRoomMessages",
  register: talkRoomMessagesRoute,
};
