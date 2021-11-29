import Hapi from "@hapi/hapi";
import { baseUrl } from "~/constants";
import { validators } from "./validators";
import { handlers } from "~/handlers/videoCalling";

export const videoCallingRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/rtc_token`,
      handler: handlers.createRTCToken,
      options: {
        validate: {
          payload: validators.create.validator.paylaod,
          failAction: validators.create.failAction,
        },
      },
    },
  ]);
};
