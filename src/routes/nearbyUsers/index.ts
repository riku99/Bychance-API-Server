import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants/url";
import { getNearbyUsersValidator } from "./validator";
import { nearbyUsersHandler } from "~/handlers/nearbyUsers";

export const nearbyUsersRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "GET",
      path: `${baseUrl}/nearbyUsers`,
      handler: nearbyUsersHandler.getNearbyUsers,
      options: {
        validate: {
          query: getNearbyUsersValidator.validate.query,
          failAction: getNearbyUsersValidator.failAction,
        },
      },
    },
  ]);
};
