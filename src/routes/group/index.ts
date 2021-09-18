import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";

const groupsUrl = `${baseUrl}/groups`;

export const groupsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: groupsUrl,
      handler: () => {},
    },
  ]);
};
