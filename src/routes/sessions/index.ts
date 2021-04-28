import Hapi from "@hapi/hapi";

import { sessionsValidator } from "./validator";
import { sessionsHandler } from "~/handlers/sessions";

export const sessionsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: "/sessions/lineLogin",
      handler: sessionsHandler.lineLogin,
      options: {
        validate: {
          ...sessionsValidator.lineLogin.validate,
          options: {
            allowUnknown: true, // headersで指定した以外のものは全て受け入れるための設定
          },
          failAction: sessionsValidator.lineLogin.failAction,
        },
      },
    },
    {
      method: "GET",
      path: "/sessions",
      handler: (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
        console.log("authです！");
        console.log(req.auth);
        return req.auth;
      },
      options: {
        auth: {
          strategies: ["simple"],
        },
      },
    },
  ]);
};
