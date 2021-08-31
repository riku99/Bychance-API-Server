import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { validators } from "./validator";
import { handlers } from "~/handlers/userSettings";

// Userの中でも設定に関するリソース
export const userSettingsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "PUT",
      path: `${baseUrl}/users/display`,
      handler: handlers.changeDisplay,
      options: {
        validate: {
          payload: validators.changeDisplay.validator.payload,
          failAction: validators.changeDisplay.failAction,
        },
      },
    },
    {
      method: "PUT",
      path: `${baseUrl}/users/videoEditDescription`,
      handler: handlers.changeVideoEditDescription,
      options: {
        validate: {
          payload: validators.changeVideoEditDescription.validator.payload,
          failAction: validators.changeVideoEditDescription.failAction,
        },
      },
    },
    {
      method: "PUT",
      path: `${baseUrl}/talkRoomMessageReceipt`,
      handler: handlers.changeTalkRoomMessageReceipt,
      options: {
        validate: {
          payload: validators.changeTalkRoomMessageReceipt.validator.payload,
          failAction: validators.changeTalkRoomMessageReceipt.failAction,
        },
      },
    },
  ]);
};
