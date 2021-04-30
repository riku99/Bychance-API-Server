import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants/url";

export const usersRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/users`,
      handler: () => {},
    },
  ]);
};
