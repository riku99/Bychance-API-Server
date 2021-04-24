// テストで使用するため初期化までされたサーバーを作るため。起動はしない

import Hapi from "@hapi/hapi";

export const initializeServer = async () => {
  const server = Hapi.server({
    port: 4001,
    host: "localhost",
  });

  server.route({
    method: "GET",
    path: "/",
    handler: (req, h) => {
      return "Hello World";
    },
  });

  await server.initialize();

  return server;
};
