import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants/url";
import { createTalkRoomMessageValidator } from "./validator";
import { talkRoomMessagesHandler } from "~/handlers/talkRoomMessages";

export const talkRoomMessagesRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/talkRoomMessages`,
      handler: talkRoomMessagesHandler.createTalkRoomMessage,
      options: {
        validate: {
          payload: createTalkRoomMessageValidator.validate.payload,
          failAction: createTalkRoomMessageValidator.failAction,
        },
      },
    },
  ]);
};
