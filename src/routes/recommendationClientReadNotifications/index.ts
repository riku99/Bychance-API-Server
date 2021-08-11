import Hapi from "@hapi/hapi";
import { baseUrl } from "~/constants";

import { handlers } from "~/handlers/recommendationClientReadNotification";

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
      },
    },
  ]);
};
