// テストで使用するため初期化までされたサーバーが必要なので初期化と起動でプロセス分ける

import Hapi from "@hapi/hapi";
import AuthBearer from "hapi-auth-bearer-token";

import { rootPlugin } from "~/plugins/root";
import { prismaPlugin } from "~/plugins/prisma";
import { noncePlugin } from "~/plugins/nonce";
import { sesisonsPlugin } from "~/plugins/sessions";
import { usersPlugin } from "~/plugins/users";
import { postsPlugin } from "~/plugins/posts";
import { flashesPlugin } from "~/plugins/flashes";
import { checkBeareAccessToken } from "~/auth/bearer";
import { throwLoginError } from "~/helpers/errors";

const server = Hapi.server({
  port: 4001,
  host: "localhost",
  debug: false,
});

export const initializeServer = async () => {
  // @ts-ignore
  await server.register(AuthBearer); // authをプラグインとして登録する場合、routeの登録よりも先にしないと死ぬ

  server.auth.strategy("simple", "bearer-access-token", {
    validate: checkBeareAccessToken,
    unauthorized: () => {
      // unauthorizedはtokenが存在しない場合、validateに渡した関数から{isValid: false}が返された場合に実行される
      console.log("認可失敗");
      throwLoginError();
    },
  });

  server.auth.default("simple");

  await server.register({
    plugin: require("hapi-pino"),
    options: {
      prettyPrint: true, // ログを整った形で出力する。本番環境ではfalseにする
      redact: ["req.headers.authorization"],
      logPayload: false, // ログにリクエストpayloadを出力
      logQueryParams: true, // ログにクエリパラメータを出力
    },
  });

  await server.register([
    prismaPlugin,
    noncePlugin,
    rootPlugin,
    sesisonsPlugin,
    usersPlugin,
    postsPlugin,
    flashesPlugin,
  ]);

  await server.initialize();

  return server;
};

export const startServer = async (server: Hapi.Server) => {
  await server.start();
  console.log("サーバー起動: " + server.info.uri);

  return server;
};
