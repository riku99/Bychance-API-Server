import Hapi from "@hapi/hapi";
import { baseUrl } from "~/constants";

import { validators } from "./validator";
import { handlers } from "~/handlers/userHideRecommendations";

export const userHideRecommendationsPath = `${baseUrl}/user_hide_recommendations`;

export const userHideRecommendationsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: userHideRecommendationsPath,
      handler: handlers.create,
      options: {
        validate: {
          payload: validators.create.validator.payload,
          failAction: validators.create.failAction,
        },
      },
    },
  ]);
};
