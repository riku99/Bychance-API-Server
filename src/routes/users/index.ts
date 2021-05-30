import Hapi from "@hapi/hapi";

import {
  updateUserValidator,
  refreshUserValidator,
  updateLocationValidator,
  changeUserDisplayValidator,
  changeVideoEditDescriptionValidator,
  changeTalkRoomMessageReceiptValidator,
} from "./validator";
import { usersHandler } from "~/handlers/users";
import { baseUrl } from "~/constants/url";
import { maxBytes } from "~/config/apis/size";

export const usersRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "PATCH",
      path: `${baseUrl}/users`,
      handler: usersHandler.updateUser,
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
      path: `${baseUrl}/users/refresh`,
      handler: usersHandler.refreshUser,
      options: {
        validate: {
          payload: refreshUserValidator.validate.payload,
          failAction: refreshUserValidator.failAction,
        },
      },
    },
    {
      method: "PATCH",
      path: `${baseUrl}/users/location`,
      handler: usersHandler.updateLocation,
      options: {
        validate: {
          payload: updateLocationValidator.validate.payload,
          failAction: updateLocationValidator.failAction,
        },
      },
    },
    {
      method: "PATCH",
      path: `${baseUrl}/users/display`,
      handler: usersHandler.changeDisplay,
      options: {
        validate: {
          payload: changeUserDisplayValidator.validator.payload,
          failAction: changeUserDisplayValidator.failAction,
        },
      },
    },
    {
      method: "PATCH",
      path: `${baseUrl}/users/videoEditDescription`,
      handler: usersHandler.changeVideoEditDescription,
      options: {
        validate: {
          payload: changeVideoEditDescriptionValidator.validator.payload,
          failAction: changeVideoEditDescriptionValidator.failAction,
        },
      },
    },
    {
      method: "PATCH",
      path: `${baseUrl}/users/talkRoomMessageReceipt`,
      handler: usersHandler.changeTalkRoomMessageReceipt,
      options: {
        validate: {
          payload: changeTalkRoomMessageReceiptValidator.validator.payload,
          failAction: changeTalkRoomMessageReceiptValidator.failAction,
        },
      },
    },
  ]);
};
