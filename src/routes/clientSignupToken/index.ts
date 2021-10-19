import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { clientSignupTokenValidator } from "./validator";
import { clientSignupTokenHandler } from "~/handlers/clientSignupToken";

export const clientSignupTokenPath = `${baseUrl}/client_signup_token`;

export const clientSignupTokenRoute = async (server: Hapi.Server) => {
  server.route([
    {
      // test ok
      method: "GET",
      path: `${clientSignupTokenPath}/{signupToken}`,
      handler: clientSignupTokenHandler.getClientSignupToken,
      options: {
        auth: false,
        validate: {
          params: clientSignupTokenValidator.get.validator.params,
          failAction: clientSignupTokenValidator.get.failAction,
        },
      },
    },
    {
      // test ok
      method: "POST",
      path: `${clientSignupTokenPath}`,
      handler: clientSignupTokenHandler.create,
      options: {
        auth: "console",
      },
    },
  ]);
};
