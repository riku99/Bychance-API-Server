import Hapi from "@hapi/hapi";
import { nonceHandler } from "~/handlers/nonce";

export const nonce = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: "/nonce",
      handler: nonceHandler.create,
    },
  ]);
};
