import Hapi from "@hapi/hapi";

import { updateUserValidator } from "./validator";
import { baseUrl } from "~/constants/url";

export const usersRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/users`,
      handler: () => {
        return;
      },
      options: {
        validate: {
          ...updateUserValidator.validate,
          failAction: updateUserValidator.failAction,
        },
      },
    },
  ]);
};
