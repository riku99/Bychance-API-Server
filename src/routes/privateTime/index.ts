import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants/url";
import { privateTimeValidator } from "./validator";
import { privateTimeHandler } from "~/handlers/privateTime";

const privateTimePath = `${baseUrl}/privateTime`;

export const privateTimeRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: privateTimePath,
      handler: privateTimeHandler.createPrivateTime,
      options: {
        validate: {
          payload: privateTimeValidator.create.validator.payload,
          failAction: privateTimeValidator.create.failAction,
        },
      },
    },
  ]);
};
