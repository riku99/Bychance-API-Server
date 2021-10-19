import Hapi from "@hapi/hapi";

import { baseUrl, maxBytes } from "~/constants";
import { validators } from "./validator";
import { handlers } from "~/handlers/recommendatoinClients";

export const recommendationClientsPath = `${baseUrl}/recommendationClients`;

export const recommendationClientsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: recommendationClientsPath,
      handler: handlers.create,
      options: {
        auth: false,
        validate: {
          headers: validators.create.validator.header,
          options: {
            allowUnknown: true,
          },
          failAction: validators.create.failAction,
        },
      },
    },
    {
      method: "GET",
      path: `${baseUrl}/recommendationClient`,
      handler: handlers.get,
      options: {
        auth: "r-client",
      },
    },
    {
      method: "PATCH",
      path: `${recommendationClientsPath}`,
      handler: handlers.update,
      options: {
        auth: "r-client",
        validate: {
          payload: validators.update.validator.payload,
          failAction: validators.update.failAction,
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
      handler: handlers.changeShowedPostModal,
      options: {
        auth: "r-client",
      },
    },
    {
      method: "DELETE",
      path: recommendationClientsPath,
      handler: handlers.deleteClient,
      options: {
        auth: "r-client",
      },
    },
    {
      // test ok
      method: "PATCH",
      path: `${baseUrl}/recommendation_clients/verified_email`,
      handler: handlers.verifyEmail,
      options: {
        auth: "r-client",
        validate: {
          payload: validators.verifyEmail.validator.payload,
          failAction: validators.verifyEmail.failAction,
        },
      },
    },
  ]);
};
