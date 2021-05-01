import Hapi from "@hapi/hapi";

import {
  updateUserValidator,
  refreshUserValidator,
  updateLocationValidator,
} from "./validator";
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
    {
      method: "PATCH",
      path: `${baseUrl}/users/refresh`,
      handler: usersHandler.refreshUser,
      options: {
        validate: {
          payload: refreshUserValidator.validate.payload,
          failAction: refreshUserValidator.failAction,
        },
      },
    },
    {
      method: "PATCH",
      path: `${baseUrl}/users/location`,
      handler: usersHandler.updateLocation,
      options: {
        validate: {
          payload: updateLocationValidator.validate.payload,
          failAction: updateLocationValidator.failAction,
        },
      },
    },
  ]);
};
