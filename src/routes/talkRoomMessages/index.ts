import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { validators } from "./validator";
import { handlers } from "~/handlers/talkRoomMessages";

export const talkRoomMessagesRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/talk_rooms/{talkRoomId}/messages`,
      handler: handlers.create,
      options: {
        validate: {
          payload: validators.create.validator.payload,
          params: validators.create.validator.params,
          failAction: validators.create.failAction,
        },
      },
    },
    {
      method: "GET",
      path: `${baseUrl}/talk_rooms/{talkRoomId}/messages`,
      handler: handlers.gets,
      options: {
        validate: {
          params: validators.gets.validator.params,
          failAction: validators.gets.failAction,
        },
      },
    },
  ]);
};
