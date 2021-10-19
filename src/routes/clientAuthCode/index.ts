import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";

const path = `${baseUrl}/client_auth_code`;

export const clientAuthGroupsRoute = async (server: Hapi.Server) => {
  server.route([]);
};
