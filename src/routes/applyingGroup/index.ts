import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { validators } from "./validator";
import { handlers } from "~/handlers/applyingGroups";

const url = `${baseUrl}/applying_groups`;

export const applyingGroupsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: url,
      handler: handlers.create,
      options: {
        validate: {
          payload: validators.createApplyingGroup.validator.payload,
          failAction: validators.createApplyingGroup.failAction,
        },
      },
    },
  ]);
};
