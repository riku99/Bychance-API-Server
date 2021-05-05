import Hapi from "@hapi/hapi";

import { talkRoomsRoute } from "~/routes/talkRooms";

export const talkRoomsPlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/talkRooms",
  register: talkRoomsRoute,
};
