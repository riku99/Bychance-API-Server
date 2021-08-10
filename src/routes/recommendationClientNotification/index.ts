import Hapi from "@hapi/hapi";
import { baseUrl } from "~/constants";

import { handlers } from "~/handlers/recommendationClientNotifications";
import { validators } from "./validator";

export const recommendationClientNotificationsPath = `${baseUrl}/recommendationClientNotifications`;

export const recommendationClientNotificationRoute = async (
  server: Hapi.Server
) => {
  server.route([
    {
      method: "GET",
      path: recommendationClientNotificationsPath,
      handler: handlers.getAll,
      options: {
        auth: "r-client",
      },
    },
    {
      method: "GET",
      path: `${recommendationClientNotificationsPath}/{id}`,
      handler: handlers.getData,
      options: {
        auth: "r-client",
        validate: {
          params: validators.get.validator.params,
          failAction: validators.get.failAction,
        },
      },
    },
  ]);
};
