import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { validators } from "./validator";
import { handlers } from "~/handlers/applyingGroups";

const path = `${baseUrl}/applying_groups`;

export const applyingGroupsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "GET",
      path,
      handler: handlers.get,
      options: {
        validate: {
          query: validators.getApplyingGroups.validator.query,
          failAction: validators.getApplyingGroups.failAction,
        },
      },
    },
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
      method: "DELETE",
      path: `${path}/{id}`,
      handler: handlers._delete,
      options: {
        validate: {
          params: validators.deleteApplyingGroup.validator.params,
          failAction: validators.deleteApplyingGroup.failAction,
        },
      },
    },
  ]);
};
