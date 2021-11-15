import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { validators } from "./validators";
import { handlers } from "~/handlers/userAuthCode";

export const userAuthCodeRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/user_auth_code`,
      handler: handlers.createUserAuthCodeAndSendEmail,
      options: {
        auth: false,
        validate: {
          payload: validators.create.validator.payload,
          failAction: validators.create.failAction,
        },
      },
    },
    {
      method: "GET",
      path: `${baseUrl}/user_auth_code/verify`,
      handler: handlers.verifyUserAuthCode,
      options: {
        auth: false,
        validate: {
          query: validators.verify.validator.query,
          failAction: validators.verify.failAction,
        },
      },
    },
  ]);
};
