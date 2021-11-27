import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { validators } from "./validator";
import { handlers } from "~/handlers/talkRooms";

export const talkRoomsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/talkRooms`,
      handler: handlers.createTalkRoom,
      options: {
        validate: {
          payload: validators.create.validator.payload,
          failAction: validators.create.failAction,
        },
      },
    },
    {
      method: "DELETE",
      path: `${baseUrl}/talkRooms/{talkRoomId}`,
      handler: handlers.deleteTalkRoom,
      options: {
        validate: {
          params: validators.delete.validator.params,
          failAction: validators.delete.failAction,
        },
      },
    },
    {
      method: "GET",
      path: `${baseUrl}/talk_rooms`,
      handler: handlers.get,
    },
  ]);
};
