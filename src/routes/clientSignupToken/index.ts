import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";

const clientSignupTokenPath = `${baseUrl}/clientSignupToken`;

export const clientSignupTokenRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "GET",
      path: `${clientSignupTokenPath}/{signupToken}`,
      handler: () => {},
      options: {
        auth: false,
      },
    },
  ]);
};
