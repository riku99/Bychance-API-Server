import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants/url";
import { privateTimeValidator } from "./validator";

const privateTimePath = `${baseUrl}/privateTime`;

export const privateTimeRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: privateTimePath,
      handler: () => {},
      options: {
        validate: {
          payload: privateTimeValidator.create.validator.payload,
          failAction: privateTimeValidator.create.failAction,
        },
      },
    },
  ]);
};
