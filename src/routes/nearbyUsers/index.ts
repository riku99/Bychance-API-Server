import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { validators } from "./validator";
import { handlers } from "~/handlers/nearbyUsers";

export const nearbyUsersRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "GET",
      path: `${baseUrl}/users/nearby`,
      handler: handlers.get,
      options: {
        validate: {
          query: validators.get.validator.query,
          failAction: validators.get.failAction,
        },
      },
    },
  ]);
};
