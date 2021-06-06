import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants/url";
import { createFlashStampValidator } from "./validator";
import { flashStampsHandler } from "~/handlers/flashStampsHandler";

const createPath = `${baseUrl}/flashStamps`;

export const flashStampsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: createPath,
      handler: flashStampsHandler.createFlashStamp,
      options: {
        validate: {
          payload: createFlashStampValidator.validate.payload,
          failAction: createFlashStampValidator.failAction,
        },
      },
    },
  ]);
};
