import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { validaotors } from "./validator";
import { handlers } from "~/handlers/block";

export const blockesRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/users/block`,
      handler: handlers.create,
      options: {
        validate: {
          payload: validaotors.create.validaotor.payload,
          failAction: validaotors.create.failAction,
        },
      },
    },
  ]);
};
