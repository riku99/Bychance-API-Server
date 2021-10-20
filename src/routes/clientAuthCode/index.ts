import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { handlers } from "~/handlers/clientAuthCode";
import { validators } from "./validator";

const basePath = `${baseUrl}/client_auth_code`;

export const clientAuthCodeRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      handler: handlers.createClientAuthCodeForPasswordReset,
      path: `${basePath}/password_reset`,
      options: {
        auth: "r-client",
      },
    },
    {
      // tets ok
      method: "GET",
      handler: handlers.verifyClientAuthCodeForPasswordReset,
      path: `${basePath}/password_reset`,
      options: {
        auth: "r-client",
        validate: {
          query: validators.verifyAuthCodeForPasswordReset.validator.query,
          failAction: validators.verifyAuthCodeForPasswordReset.failAction,
        },
      },
    },
  ]);
};
