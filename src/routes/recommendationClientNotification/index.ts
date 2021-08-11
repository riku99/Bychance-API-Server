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
    {
      method: "POST",
      path: recommendationClientNotificationsPath,
      handler: handlers.create,
      options: {
        auth: "console",
        validate: {
          payload: validators.create.validator.payload,
          failAction: validators.create.failAction,
        },
      },
    },
    {
      method: "GET",
      path: `${recommendationClientNotificationsPath}/unread`,
      handler: handlers.getUnread,
      options: {
        auth: "r-client",
      },
    },
  ]);
};
