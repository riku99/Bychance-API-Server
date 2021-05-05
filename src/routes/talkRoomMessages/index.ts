import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants/url";
import { createTalkRoomMessageValidator } from "./validator";

export const talkRoomMessagesRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/talkRoomMessages`,
      handler: () => {
        return;
      },
      options: {
        validate: {
          payload: createTalkRoomMessageValidator.validate.payload,
          failAction: createTalkRoomMessageValidator.failAction,
        },
      },
    },
  ]);
};
