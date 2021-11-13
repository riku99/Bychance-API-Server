import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { validators } from "./validators";
import { handles } from "~/handlers/userAuthCode";

export const userAuthCodeRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/user_auth_code`,
      handler: handles.createUserAuthCodeAndSendEmail,
      options: {
        auth: false,
        validate: {
          payload: validators.create.validator.payload,
          failAction: validators.create.failAction,
        },
      },
    },
  ]);
};
