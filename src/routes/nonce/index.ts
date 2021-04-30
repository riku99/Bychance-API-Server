import Hapi from "@hapi/hapi";

import { nonceHandler } from "~/handlers/nonce";
import { createNonceValidator } from "./validator";
import { baseUrl } from "~/constants/url";

export const nonce = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/nonce`,
      handler: nonceHandler.create,
      options: {
        validate: {
          payload: createNonceValidator.validate,
          failAction: createNonceValidator.failAction,
        },
        auth: false,
      },
    },
  ]);
};
