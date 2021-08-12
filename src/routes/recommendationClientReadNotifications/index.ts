import Hapi from "@hapi/hapi";
import { baseUrl } from "~/constants";

import { handlers } from "~/handlers/recommendationClientReadNotification";
import { validators } from "./validator";

const basePath = `${baseUrl}/recommendationClient/notifications/read`;

export const recommendationClientReadNotificationRoute = async (
  server: Hapi.Server
) => {
  server.route([
    {
      method: "POST",
      path: basePath,
      handler: handlers.create,
      options: {
        auth: "r-client",
        validate: {
          payload: validators.create.validation.payload,
          failAction: validators.create.failAction,
        },
      },
    },
  ]);
};
