import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { privateTimeValidator } from "./validator";
import { privateTimeHandler } from "~/handlers/privateTime";

const privateTimePath = `${baseUrl}/privateTime`;

export const privateTimeRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: privateTimePath,
      handler: privateTimeHandler.createPrivateTime,
      options: {
        validate: {
          payload: privateTimeValidator.create.validator.payload,
          failAction: privateTimeValidator.create.failAction,
        },
      },
    },
    {
      method: "GET",
      path: privateTimePath,
      handler: privateTimeHandler.getPrivateTime,
    },
    {
      method: "DELETE",
      path: `${privateTimePath}/{id}`,
      handler: privateTimeHandler.deletePrivateTime,
      options: {
        validate: {
          params: privateTimeValidator.delete.validator.params,
          failAction: privateTimeValidator.delete.failAction,
        },
      },
    },
  ]);
};
