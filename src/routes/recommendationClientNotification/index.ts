import Hapi from "@hapi/hapi";
import { baseUrl } from "~/constants";

export const recommendationClientNotificationsPath = `${baseUrl}/recommendationClientNotifications`;
import { handler } from "~/handlers/recommendationClientNotifications";

export const recommendationClientNotificationRoute = async (
  server: Hapi.Server
) => {
  server.route([
    {
      method: "GET",
      path: recommendationClientNotificationsPath,
      handler: handler.get,
      options: {
        auth: "r-client",
      },
    },
  ]);
};
