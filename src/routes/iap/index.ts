import Hapi from "@hapi/hapi";
import { baseUrl } from "~/constants";
import { failActionOfValidation } from "~/config/apis/errors";
import { validators } from "./validators";
import { handlers } from "~/handlers/iap";

export const iapRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/iap/verify`,
      handler: handlers.verifyIap,
      options: {
        validate: {
          payload: validators.post.validator.payload,
          failAction: failActionOfValidation,
        },
      },
    },
  ]);
};
