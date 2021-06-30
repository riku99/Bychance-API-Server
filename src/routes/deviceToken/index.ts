import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { createDeviceTokenValidator } from "./validator";
import { deviceTokenHandler } from "~/handlers/deviceToken";

export const deviceTokenRoute = (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/deviceToken`,
      handler: deviceTokenHandler.createDeviceToken,
      options: {
        validate: {
          payload: createDeviceTokenValidator.validate.payload,
          failAction: createDeviceTokenValidator.failAction,
        },
      },
    },
  ]);
};
