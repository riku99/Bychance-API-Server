import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { createViewedFlashValidator } from "./validator";
import { viewedFlashHandler } from "~/handlers/viewedFlashes";

export const viewedFlashesRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/viewedFlashes`,
      handler: viewedFlashHandler.createViewedFlash,
      options: {
        validate: {
          payload: createViewedFlashValidator.validate.payload,
          failAction: createViewedFlashValidator.failAction,
        },
      },
    },
  ]);
};
