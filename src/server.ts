// テストで使用するため初期化までされたサーバーが必要なので初期化と起動でプロセス分ける

import Hapi, { Plugin } from "@hapi/hapi";
import AuthBearer from "hapi-auth-bearer-token";

import { rootPlugin } from "~/plugins/root";
import { prismaPlugin } from "~/plugins/prisma";
import { noncePlugin } from "~/plugins/nonce";
import { sesisonsPlugin } from "~/plugins/sessions";

const server = Hapi.server({
  port: 4001,
  host: "localhost",
});

const validate = async () => {
  return { isValid: true, credentials: { name: "sutehage" } };
};

const a: Plugin<any> = {
  name: "",
  register: async (server: Hapi.Server) => {},
};

export const initializeServer = async () => {
  // authをプラグインとして登録する場合、routeの登録よりも先にしないと死ぬ
  await server.register(AuthBearer));
  server.auth.strategy("simple", "bearer-access-token", { validate });

  await server.register([
    rootPlugin,
    prismaPlugin,
    noncePlugin,
    sesisonsPlugin,
  ]);

  await server.initialize();

  return server;
};

export const startServer = async (server: Hapi.Server) => {
  await server.start();
  console.log("サーバー起動: " + server.info.uri);

  return server;
};
