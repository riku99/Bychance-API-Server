import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { privateZoneHandler } from "~/handlers/privateZone";
import { privateZoneValidator } from "./validator";

const privateZonePath = `${baseUrl}/privateZone`;

export const privateZoneRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "GET",
      path: privateZonePath,
      handler: privateZoneHandler.getPrivateZone,
    },
    {
      method: "POST",
      path: privateZonePath,
      handler: privateZoneHandler.createPrivateZone,
      options: {
        validate: {
          payload: privateZoneValidator.create.validator.payload,
          failAction: privateZoneValidator.create.failAction,
        },
      },
    },
    {
      method: "DELETE",
      path: `${privateZonePath}/{id}`,
      handler: privateZoneHandler.deletePrivateZone,
      options: {
        validate: {
          params: privateZoneValidator.delete.validator.params,
          failAction: privateZoneValidator.delete.failAction,
        },
      },
    },
  ]);
};
