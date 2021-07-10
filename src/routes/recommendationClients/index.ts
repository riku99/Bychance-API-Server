import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { recommendationClientValidator } from "./validator";

const recommendationClientsPath = `${baseUrl}/recommendationClients`;

export const recommendationClientsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: recommendationClientsPath,
      handler: () => {},
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
  ]);
};
