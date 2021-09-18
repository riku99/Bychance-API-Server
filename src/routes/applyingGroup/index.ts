import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { validators } from "./validator";
import { handlers } from "~/handlers/applyingGroups";

const path = `${baseUrl}/applying_groups`;

export const applyingGroupsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path,
      handler: handlers.create,
      options: {
        validate: {
          payload: validators.createApplyingGroup.validator.payload,
          failAction: validators.createApplyingGroup.failAction,
        },
      },
    },
    {
      method: "GET",
      path: `${path}/applyed`,
      handler: handlers.getApplyedGroups,
    },
  ]);
};
