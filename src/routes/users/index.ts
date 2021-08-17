import Hapi from "@hapi/hapi";

import {
  updateUserValidator,
  refreshUserValidator,
  updateLocationValidator,
  changeUserDisplayValidator,
  changeVideoEditDescriptionValidator,
  changeTalkRoomMessageReceiptValidator,
  changeShowReceiveMessageValidator,
  validators,
} from "./validator";
import { handlers } from "~/handlers/users";
import { baseUrl } from "~/constants";
import { maxBytes } from "~/config/apis/size";

const changeShowReceiveMessagePath = `${baseUrl}/users/showReceiveMessage`;
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
      method: "GET",
      path: `${baseUrl}/users/refresh/{userId}`,
      handler: handlers.refreshUser,
      options: {
        validate: {
          params: refreshUserValidator.validate.params,
          failAction: refreshUserValidator.failAction,
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
      method: "PATCH",
      path: `${baseUrl}/users/display`,
      handler: handlers.changeDisplay,
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
      handler: handlers.changeVideoEditDescription,
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
      handler: handlers.changeTalkRoomMessageReceipt,
      options: {
        validate: {
          payload: changeTalkRoomMessageReceiptValidator.validator.payload,
          failAction: changeTalkRoomMessageReceiptValidator.failAction,
        },
      },
    },
    {
      method: "PATCH",
      path: changeShowReceiveMessagePath,
      handler: handlers.changeShowReceiveMessage,
      options: {
        validate: {
          payload: changeShowReceiveMessageValidator.validator.payload,
          failAction: changeShowReceiveMessageValidator.failAction,
        },
      },
    },
  ]);
};
