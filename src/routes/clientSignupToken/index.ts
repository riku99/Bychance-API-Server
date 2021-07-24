import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { clientSignupTokenValidator } from "./validator";
import { clientSignupTokenHandler } from "~/handlers/clientSignupToken";

const clientSignupTokenPath = `${baseUrl}/clientSignupToken`;

export const clientSignupTokenRoute = async (server: Hapi.Server) => {
  server.route([
    {
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
      method: "POST",
      path: `${clientSignupTokenPath}`,
      handler: clientSignupTokenHandler.create,
      options: {
        auth: "r-client",
      },
    },
  ]);
};
