import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { validators } from "./validators";

export const userAuthCodeRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/user_auth_code`,
      handler: () => {},
      options: {
        validate: {
          payload: validators.create.validator.payload,
          failAction: validators.create.failAction,
        },
      },
    },
  ]);
};
