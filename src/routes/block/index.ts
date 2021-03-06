import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import { validaotors } from "./validator";
import { handlers } from "~/handlers/block";

export const blockesRoute = async (server: Hapi.Server) => {
  server.route([
    {
      // test ok
      method: "POST",
      path: `${baseUrl}/users/block`,
      handler: handlers.create,
      options: {
        validate: {
          payload: validaotors.create.validaotor.payload,
          failAction: validaotors.create.failAction,
        },
      },
    },
    {
      // test ok
      method: "DELETE",
      path: `${baseUrl}/users/{userId}/block`,
      handler: handlers._delete,
      options: {
        validate: {
          params: validaotors.delete.validaotor.params,
          failAction: validaotors.delete.failAction,
        },
      },
    },
    {
      // test ok
      method: "GET",
      path: `${baseUrl}/groups/members/block/{userId}`,
      handler: handlers.getGroupMemberWhoBlcokTargetUserExists,
      options: {
        validate: {
          params: validaotors.getGroupMembersBlockData.validaotor.params,
          failAction: validaotors.getGroupMembersBlockData.failAction,
        },
      },
    },
  ]);
};
