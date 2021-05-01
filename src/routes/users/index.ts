import Hapi from "@hapi/hapi";

import { updateUserValidator } from "./validator";
import { usersHandler } from "~/handlers/users";
import { baseUrl } from "~/constants/url";

export const usersRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "PATCH",
      path: `${baseUrl}/users`,
      handler: usersHandler.updateUser,
      options: {
        validate: {
          ...updateUserValidator.validate,
          failAction: updateUserValidator.failAction,
        },
      },
    },
  ]);
};
