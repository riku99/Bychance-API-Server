import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { validators } from "./validators";
import { handlers } from "~/handlers/groups";

const groupsUrl = `${baseUrl}/groups`;

export const groupsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: groupsUrl,
      handler: handlers.create,
      options: {
        validate: {
          payload: validators.create.validator.payload,
          failAction: validators.create.failAction,
        },
      },
    },
    {
      method: "GET",
      path: `${baseUrl}/users/{userId}/groups`,
      handler: handlers.get,
      options: {
        validate: {
          params: validators.get.validator.params,
          failAction: validators.get.failAction,
        },
      },
    },
    {
      method: "DELETE",
      path: groupsUrl,
      handler: handlers.deleteGroup,
    },
  ]);
};
