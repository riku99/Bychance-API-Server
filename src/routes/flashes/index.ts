import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants/url";
import { createFlashValidator, deleteFlashValidator } from "./validator";
import { flashesHabdler } from "~/handlers/flashes";
import { maxBytes } from "~/config/apis/size";

export const flashesRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/flashes`,
      handler: flashesHabdler.createFlash,
      options: {
        validate: {
          payload: createFlashValidator.validate.payload,
          failAction: createFlashValidator.failAction,
        },
        payload: {
          maxBytes,
        },
      },
    },
    {
      method: "DELETE",
      path: `${baseUrl}/flashes/{flashId}`,
      handler: flashesHabdler.deleteFlash,
      options: {
        validate: {
          params: deleteFlashValidator.validate.params,
          failAction: deleteFlashValidator.failAction,
        },
      },
    },
  ]);
};
