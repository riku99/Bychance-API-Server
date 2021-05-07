import Hapi from "@hapi/hapi";

import { deleteTalkRoomsRoute } from "~/routes/deleteTalkRooms";

export const deleteTalkRoomsPlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/deleteTalkRooms",
  register: deleteTalkRoomsRoute,
};
