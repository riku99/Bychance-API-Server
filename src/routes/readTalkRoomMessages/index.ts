import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants/url";
import { createReadTalkRoomMessagesValidator } from "./validator";
import { readTalkRoomMessageHandler } from "~/handlers/readTalkRoomMessages";

export const readTalkRoomMessagesRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/readTalkRoomMessages`,
      handler: readTalkRoomMessageHandler.createReadTalkRoomMessage,
      options: {
        validate: {
          payload: createReadTalkRoomMessagesValidator.validate.payload,
          failAction: createReadTalkRoomMessagesValidator.failAction,
        },
      },
    },
  ]);
};
