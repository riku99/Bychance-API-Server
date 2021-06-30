import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { createTalkRoomValidator, deleteTalkRoomValidator } from "./validator";
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
    {
      method: "DELETE",
      path: `${baseUrl}/talkRooms/{talkRoomId}`,
      handler: talkRoomsHandler.deleteTalkRoom,
      options: {
        validate: {
          params: deleteTalkRoomValidator.validate.params,
          failAction: deleteTalkRoomValidator.failAction,
        },
      },
    },
  ]);
};
