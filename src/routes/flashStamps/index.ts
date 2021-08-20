import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { validators } from "./validator";
import { handlers } from "~/handlers/flashStamps";

const createPath = `${baseUrl}/flashStamps`;

export const flashStampsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: createPath,
      handler: handlers.createFlashStamp,
      options: {
        validate: {
          payload: validators.create.validator.payload,
          failAction: validators.create.failAction,
        },
      },
    },
    {
      method: "GET",
      path: `${baseUrl}/flashes/{flashId}/stamps`,
      handler: handlers.get,
      options: {
        validate: {
          params: validators.get.validator.params,
          failAction: validators.get.failAction,
        },
      },
    },
  ]);
};
