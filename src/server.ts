// テストで使用するため初期化までされたサーバーが必要なので初期化と起動でプロセス分ける

import Hapi from "@hapi/hapi";
import AuthBearer from "hapi-auth-bearer-token";
import socketio from "socket.io";
import admin from "firebase-admin";
import cron from "node-cron";

import {
  checkBeareAccessToken,
  checkRecommendationClient,
  checkConsoleAdmin,
} from "~/auth/bearer";
import { throwLoginError } from "~/helpers/errors";
import { setupSocketIo } from "~/sokcetIo";
import { rootPlugin } from "~/plugins/root";
import { prismaPlugin } from "~/plugins/prisma";
import { noncePlugin } from "~/plugins/nonce";
import { sesisonsPlugin } from "~/plugins/sessions";
import { usersPlugin } from "~/plugins/users";
import { postsPlugin } from "~/plugins/posts";
import { flashesPlugin } from "~/plugins/flashes";
import { viewedFlashesPlugin } from "~/plugins/viewedFlashes";
import { nearbyUsersPlugin } from "~/plugins/nearbyUsers";
import { talkRoomsPlugin } from "~/plugins/talkRooms";
import { talkRoomMessagesPlugin } from "~/plugins/talkRoomMessages";
import { readTalkRoomMessagesPlugin } from "~/plugins/readTalkRoomMessages";
import { deviceTokenPlugin } from "~/plugins/deviceToken";
import { flashStampsPlugin } from "~/plugins/flashStamps";
import { privateZonePlugin } from "~/plugins/privateZone";
import { privateTimePlugin } from "~/plugins/privateTime";
import { deleteExpiredViewedFlashes } from "~/helpers/viewedFlash";
import { recommendationClientsPlugin } from "~/plugins/recommendationClients";
import { clientSignupTokenPlugin } from "~/plugins/clientSignupToken";
import { recommendationsPlugin } from "~/plugins/recommendations";
import { recommendationClientNotificationsPlugin } from "~/plugins/recommendationClientNotifications";
import { userHideRecommendatoinsPlugin } from "~/plugins/userHideRecommnedations";
import { recommendationClientReadNotificationPlugin } from "~/plugins/recommendationClientReadNotification";
import { blockesRoute } from "~/routes/block";
import { userSettingsRoute } from "~/routes/userSettings";
import { groupsRoute } from "~/routes/group";
import { applyingGroupsRoute } from "~/routes/applyingGroup";

const server = Hapi.server({
  port: process.env.PORT || 4001,
  // host: "localhost", // このコメントされてる2つ含めるとwsがうまく動かないのでいったん外す
  // debug: false,
});

export const io = new socketio.Server(server.listener);
export const talkRoomMessageNameSpace = io.of("/talkRoomMessages");
setupSocketIo();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// ClientConsole用プロジェクト
admin.initializeApp(
  {
    credential: admin.credential.cert({
      projectId: process.env.CLIENT_FIREBASE_PROJECT_ID,
      clientEmail: process.env.CLIENT_FIREBASE_EMAIL,
      privateKey: process.env.CLIENT_FIREBASE_PRIVATE_KEY!.replace(
        /\\n/g,
        "\n"
      ),
    }),
  },
  "recommendationClient"
);

admin.initializeApp(
  {
    credential: admin.credential.cert({
      projectId: process.env.CONSOLE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.CONSOLE_FIREBASE_EMAIL,
      privateKey: process.env.CONSOLE_FIREBASE_PRIVATE_KEY!.replace(
        /\\n/g,
        "\n"
      ),
    }),
  },
  "console"
);

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

  server.auth.strategy("r-client", "bearer-access-token", {
    validate: checkRecommendationClient,
    unauthorized: () => {
      throwLoginError();
    },
  });

  server.auth.strategy("console", "bearer-access-token", {
    validate: checkConsoleAdmin,
    unauthorized: () => {
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
    viewedFlashesPlugin,
    nearbyUsersPlugin,
    talkRoomsPlugin,
    talkRoomMessagesPlugin,
    readTalkRoomMessagesPlugin,
    deviceTokenPlugin,
    flashStampsPlugin,
    privateZonePlugin,
    privateTimePlugin,
    recommendationClientsPlugin,
    clientSignupTokenPlugin,
    recommendationsPlugin,
    recommendationClientNotificationsPlugin,
    userHideRecommendatoinsPlugin,
    recommendationClientReadNotificationPlugin,
  ]);
  // シンプルにルート定義するためだけにplugin設定する必要ない。
  blockesRoute(server);
  userSettingsRoute(server);
  groupsRoute(server);
  applyingGroupsRoute(server);

  await server.initialize();

  return server;
};

export const startServer = async (server: Hapi.Server) => {
  cron.schedule("0 0 0 * * *", deleteExpiredViewedFlashes); // 毎日0時に実行
  await server.start();
  console.log("サーバー起動: " + server.info.uri);

  return server;
};
