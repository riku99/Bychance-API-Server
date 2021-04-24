// テストで使用するため初期化までされたサーバーが必要なので初期化と起動でプロセス分ける

import Hapi from "@hapi/hapi";
import { rootPlugin } from "~/plugins/root";
import { prismaPlugin } from "~/plugins/prisma";

const server = Hapi.server({
  port: 4001,
  host: "localhost",
});

export const initializeServer = async () => {
  await server.register([rootPlugin, prismaPlugin]);
  await server.initialize();

  return server;
};

export const startServer = async (server: Hapi.Server) => {
  await server.start();
  console.log("サーバー起動: " + server.info.uri);

  return server;
};
