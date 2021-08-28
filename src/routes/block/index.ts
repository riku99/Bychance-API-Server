import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { validaotors } from "./validator";
import { handlers } from "~/handlers/block";

export const blockesRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/users/block`,
      handler: handlers.create,
      options: {
        validate: {
          payload: validaotors.create.validaotor.payload,
          failAction: validaotors.create.failAction,
        },
      },
    },
    {
      method: "DELETE",
      path: `${baseUrl}/users/{userId}/block`,
      handler: handlers._delete,
      options: {
        validate: {
          params: validaotors.delete.validaotor.params,
          failAction: validaotors.delete.failAction,
        },
      },
    },
  ]);
};
