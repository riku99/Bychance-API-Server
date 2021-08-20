import Hapi from "@hapi/hapi";

import { sessionsValidator } from "./validator";
import { sessionsHandler } from "~/handlers/sessions";
import { baseUrl } from "~/constants";

export const lineLoginPath = `${baseUrl}/sessions/lineLogin`;
export const sessionLoginPath = `${baseUrl}/login_data`;
export const logoutPath = `${baseUrl}/sessions/logout`;

export const sessionsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: lineLoginPath,
      handler: sessionsHandler.lineLogin,
      options: {
        validate: {
          // ...sessionsValidator.lineLogin.validate,
          headers: sessionsValidator.lineLogin.validate.headers,
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
      path: sessionLoginPath,
      handler: sessionsHandler.sessionLogin,
    },
    {
      method: "GET",
      path: logoutPath,
      handler: sessionsHandler.logout,
    },
    {
      method: "GET",
      path: `${baseUrl}/sampleLogin`,
      handler: sessionsHandler.sampleLogin,
      options: {
        auth: false,
      },
    },
  ]);
};
