import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";

const recommendationClientsPath = `${baseUrl}/recommendationClients`;

export const recommendationClientsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: recommendationClientsPath,
      handler: () => {},
    },
  ]);
};
