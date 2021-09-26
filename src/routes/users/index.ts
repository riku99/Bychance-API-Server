import Hapi from "@hapi/hapi";

import {
  updateUserValidator,
  updateLocationValidator,
  validators,
} from "./validator";
import { handlers } from "~/handlers/users";
import { baseUrl } from "~/constants";
import { maxBytes } from "~/config/apis/size";

const usersLocation = `${baseUrl}/users/location`;

export const usersRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "GET",
      path: `${baseUrl}/users/{userId}/page_info`,
      handler: handlers.getUserPageInfo,
      options: {
        validate: {
          params: validators.getUser.validator.params,
          failAction: validators.getUser.failAction,
        },
      },
    },
    {
      method: "GET",
      path: `${baseUrl}/my_refresh_data`,
      handler: handlers.refreshMyData,
    },
    {
      method: "PATCH",
      path: `${baseUrl}/users`,
      handler: handlers.updateUser,
      options: {
        validate: {
          ...updateUserValidator.validate,
          failAction: updateUserValidator.failAction,
        },
        payload: {
          maxBytes,
        },
      },
    },
    {
      method: "PATCH",
      path: `${baseUrl}/users/location`,
      handler: handlers.updateLocation,
      options: {
        validate: {
          payload: updateLocationValidator.validate.payload,
          failAction: updateLocationValidator.failAction,
        },
      },
    },
    {
      method: "DELETE",
      path: usersLocation,
      handler: handlers.deleteLocation,
    },
    {
      method: "PUT",
      path: `${baseUrl}/users/tooltip_of_user_display_showed`,
      handler: handlers.changeTooltipOfUsersDisplayShowed,
      options: {
        validate: {
          payload:
            validators.changeTooltipOfUsersDisplayShowed.validator.payload,
          failAction: validators.changeTooltipOfUsersDisplayShowed.failAction,
        },
      },
    },
    {
      method: "GET",
      path: `${baseUrl}/users/is_displayed`,
      handler: handlers.isDisplayed,
    },
    {
      method: "PUT",
      path: `${baseUrl}/users/groups_application_enabled`,
      handler: handlers.changeGroupsApplicationEnabled,
      options: {
        validate: {
          payload: validators.changeGroupsApplicationEnabled.validator.payload,
          failAction: validators.changeGroupsApplicationEnabled.failAction,
        },
      },
    },
    {
      method: "DELETE",
      path: `${baseUrl}/users/groupId`,
      handler: handlers.deleteGroupId,
    },
  ]);
};
