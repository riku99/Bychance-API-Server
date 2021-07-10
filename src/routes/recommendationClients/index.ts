import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { recommendationClientValidator } from "./validator";
import { recommendationClientHandler } from "~/handlers/recommendatoinClients";

const recommendationClientsPath = `${baseUrl}/recommendationClients`;

export const recommendationClientsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: recommendationClientsPath,
      handler: recommendationClientHandler.create,
      options: {
        auth: false,
        validate: {
          payload: recommendationClientValidator.create.validator.payload,
          headers: recommendationClientValidator.create.validator.header,
          options: {
            allowUnknown: true,
          },
          failAction: recommendationClientValidator.create.failAction,
        },
      },
    },
    {
      method: "GET",
      path: `${baseUrl}/recommendationClient`,
      handler: recommendationClientHandler.get,
      options: {
        auth: "r-client",
      },
    },
  ]);
};
