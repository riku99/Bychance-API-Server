import Hapi from "@hapi/hapi";

import { sessionsHandler } from "~/handlers/sessions";
import { baseUrl } from "~/constants";

export const sessionsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "GET",
      path: `${baseUrl}/login_data`,
      handler: sessionsHandler.getLoginData,
    },
    {
      method: "DELETE",
      path: `${baseUrl}/sessions`,
      handler: sessionsHandler.logout,
    },
  ]);
};
