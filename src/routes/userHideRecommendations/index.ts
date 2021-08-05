import Hapi from "@hapi/hapi";
import { baseUrl } from "~/constants";

export const userHideRecommendationsPath = `${baseUrl}/userHideRecommendations`;
import { validators } from "./validator";
import { handlers } from "~/handlers/userHideRecommendations";

export const userHideRecommendationsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${userHideRecommendationsPath}/{id}`,
      handler: handlers.create,
      options: {
        validate: {
          params: validators.create.validator.params,
          failAction: validators.create.failAction,
        },
      },
    },
  ]);
};
