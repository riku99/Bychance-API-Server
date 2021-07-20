import Hapi from "@hapi/hapi";
import { baseUrl } from "~/constants";

import { recommendationValidator } from "./validator";
import { recommendationHandler } from "~/handlers/recommendations";

const recommendationsPath = `${baseUrl}/recommendations`;

export const recommendationsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: recommendationsPath,
      handler: recommendationHandler.create,
      options: {
        payload: {
          maxBytes: 100000000,
        },
        auth: "r-client",
        validate: {
          payload: recommendationValidator.create.validator.payload,
          failAction: recommendationValidator.create.failAction,
        },
      },
    },
    {
      method: "GET",
      path: `${recommendationsPath}/client`,
      handler: recommendationHandler.getForClient,
      options: {
        auth: "r-client",
        validate: {
          query: recommendationValidator.getForClient.validator.query,
          failAction: recommendationValidator.getForClient.failAction,
        },
      },
    },
    {
      method: "GET",
      path: `${recommendationsPath}/hide/{id}`,
      handler: recommendationHandler.hide,
      options: {
        auth: "r-client",
        validate: {
          params: recommendationValidator.hide.validator.params,
          failAction: recommendationValidator.hide.failAction,
        },
      },
    },
  ]);
};
