import Hapi from "@hapi/hapi";

import {
  updateUserValidator,
  updateLocationValidator,
  validators,
} from "./validator";
import { handlers } from "~/handlers/users";
import { baseUrl } from "~/constants";
import { maxBytes } from "~/config/apis/size";

export const usersRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/users`,
      handler: handlers.createUser,
      options: {
        auth: false,
        validate: {
          payload: validators.createUser.validater.payload,
          headers: validators.createUser.validater.header,
          failAction: validators.createUser.failAction,
          options: {
            allowUnknown: true,
          },
        },
      },
    },
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
      // not tested
      method: "GET",
      path: `${baseUrl}/users/my_refresh_data`,
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
      path: `${baseUrl}/users/locations`,
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
      path: `${baseUrl}/users/locations`,
      handler: handlers.deleteLocation,
    },
    {
      // not tested
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
      // not tested
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
      path: `${baseUrl}/users/group_id`,
      handler: handlers.deleteGroupId,
    },
    {
      method: "PUT",
      path: `${baseUrl}/users/display`,
      handler: handlers.changeDisplay,
      options: {
        validate: {
          payload: validators.changeDisplay.validator.payload,
          failAction: validators.changeDisplay.failAction,
        },
      },
    },
    {
      // not tested
      method: "PUT",
      path: `${baseUrl}/users/videoEditDescription`,
      handler: handlers.changeVideoEditDescription,
      options: {
        validate: {
          payload: validators.changeVideoEditDescription.validator.payload,
          failAction: validators.changeVideoEditDescription.failAction,
        },
      },
    },
    {
      method: "PUT",
      path: `${baseUrl}/users/talk_room_messages_receipt`,
      handler: handlers.changeTalkRoomMessageReceipt,
      options: {
        validate: {
          payload: validators.changeTalkRoomMessageReceipt.validator.payload,
          failAction: validators.changeTalkRoomMessageReceipt.failAction,
        },
      },
    },
    {
      // not tested
      method: "PUT",
      path: `${baseUrl}/users/show_receive_message`,
      handler: handlers.changeShowReceiveMessage,
      options: {
        validate: {
          payload: validators.changeShowReceiveMessage.validator.payload,
          failAction: validators.changeShowReceiveMessage.failAction,
        },
      },
    },
    {
      // not tested
      method: "PUT",
      path: `${baseUrl}/users/intro`,
      handler: handlers.changeIntro,
      options: {
        validate: {
          payload: validators.changeIntro.validator.payload,
          failAction: validators.changeIntro.failAction,
        },
      },
    },
  ]);
};
