import Hapi from "@hapi/hapi";

import { baseUrl, maxBytes } from "~/constants";
import { recommendationClientValidator } from "./validator";
import { recommendationClientHandler } from "~/handlers/recommendatoinClients";

export const recommendationClientsPath = `${baseUrl}/recommendationClients`;

export const recommendationClientsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: recommendationClientsPath,
      handler: recommendationClientHandler.create,
      options: {
        auth: false,
        validate: {
          payload: recommendationClientValidator.create.validator.payload,
          headers: recommendationClientValidator.create.validator.header,
          options: {
            allowUnknown: true,
          },
          failAction: recommendationClientValidator.create.failAction,
        },
      },
    },
    {
      method: "GET",
      path: `${baseUrl}/recommendationClient`,
      handler: recommendationClientHandler.get,
      options: {
        auth: "r-client",
      },
    },
    {
      method: "PATCH",
      path: `${recommendationClientsPath}`,
      handler: recommendationClientHandler.update,
      options: {
        auth: "r-client",
        validate: {
          payload: recommendationClientValidator.update.validator.payload,
          failAction: recommendationClientValidator.update.failAction,
        },
        payload: {
          timeout: 20000,
          maxBytes,
        },
      },
    },
    {
      method: "PATCH",
      path: `${recommendationClientsPath}/showedPostModal`,
      handler: recommendationClientHandler.changeShowedPostModal,
      options: {
        auth: "r-client",
      },
    },
    {
      method: "DELETE",
      path: recommendationClientsPath,
      handler: recommendationClientHandler.deleteClient,
      options: {
        auth: "r-client",
      },
    },
  ]);
};
