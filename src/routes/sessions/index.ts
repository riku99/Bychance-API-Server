import Hapi from "@hapi/hapi";

import { sessionsValidator } from "./validator";
import { sessionsHandler } from "~/handlers/sessions";

export const sessionsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: "/sessions/lineLogin",
      handler: sessionsHandler.line.create,
      options: {
        validate: {
          headers: sessionsValidator.line.create.headers,
          options: {
            allowUnknown: true, // headersで指定した以外のものは全て受け入れるための設定
          },
        },
      },
    },
  ]);
};
