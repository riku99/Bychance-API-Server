import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants/url";
import { createTalkRoomValidator } from "./validator";

export const talkRoomsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/talkRooms`,
      handler: () => {
        return;
      },
      options: {
        validate: {
          payload: createTalkRoomValidator.validate.payload,
          failAction: createTalkRoomValidator.failAction,
        },
      },
    },
  ]);
};
