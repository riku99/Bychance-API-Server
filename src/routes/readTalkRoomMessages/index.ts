import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { validators } from "./validator";
import { handlers } from "~/handlers/readTalkRoomMessages";

export const readTalkRoomMessagesRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/talk_rooms/{talkRoomId}/messages/read`,
      handler: handlers.create,
      options: {
        validate: {
          payload: validators.create.validator.payload,
          params: validators.create.validator.params,
          failAction: validators.create.failAction,
        },
      },
    },
  ]);
};
