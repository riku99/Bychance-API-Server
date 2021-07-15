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
        validate: {
          payload: recommendationValidator.create.validator.payload,
          failAction: recommendationValidator.create.failAction,
        },
      },
    },
  ]);
};
