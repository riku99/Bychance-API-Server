import Hapi from "@hapi/hapi";

import { sessionsValidator } from "./validator";
import { sessionsHandler } from "~/handlers/sessions";
import { baseUrl } from "~/constants/url";

export const sessionsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/sessions/lineLogin`,
      handler: sessionsHandler.lineLogin,
      options: {
        validate: {
          ...sessionsValidator.lineLogin.validate,
          options: {
            allowUnknown: true, // headersで指定した以外のものは全て受け入れるための設定
          },
          failAction: sessionsValidator.lineLogin.failAction,
        },
        auth: false,
      },
    },
    {
      method: "GET",
      path: `${baseUrl}/sessions`,
      handler: sessionsHandler.sessionLogin,
    },
  ]);
};
