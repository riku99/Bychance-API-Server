import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants/url";
import { createTalkRoomValidator } from "./validator";
import { talkRoomsHandler } from "~/handlers/talkRooms";

export const talkRoomsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/talkRooms`,
      handler: talkRoomsHandler.createTalkRoom,
      options: {
        validate: {
          payload: createTalkRoomValidator.validate.payload,
          failAction: createTalkRoomValidator.failAction,
        },
      },
    },
  ]);
};
