import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants/url";

export const privateZoneRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "GET",
      path: `${baseUrl}/privateZone`,
      handler: () => {},
    },
  ]);
};
