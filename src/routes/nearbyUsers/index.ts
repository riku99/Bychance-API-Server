import Hapi from "@hapi/hapi";
import { baseUrl } from "~/constants/url";

export const nearbyUsersRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "GET",
      path: `${baseUrl}/nearbyUsers`,
      handler: () => {},
      options: {},
    },
  ]);
};
