// テストで使用するため初期化までされたサーバーが必要なので初期化と起動でプロセス分ける
import Hapi from "@hapi/hapi";
import AuthBearer from "hapi-auth-bearer-token";
import socketio from "socket.io";
import cron from "node-cron";
import {
  checkUserToken,
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
import { groupsRoute } from "~/routes/groups";
import { applyingGroupsRoute } from "~/routes/applyingGroup";
import { registerFirebaseAdmin } from "~/firebase";
import { userAuthCodeRoute } from "~/routes/userAuthCode";
import { videoCallingRoute } from "~/routes/videoCalling";
import { iapRoute } from "~/routes/iap";
import { verifyRecieptBatch } from "~/helpers/iap/verifyRecieptBatch";

export const server = Hapi.server({
  port: process.env.PORT || 4001,
  // host: "localhost", // このコメントされてる2つ含めるとwsがうまく動かないのでいったん外す
  // debug: false,
});

export const io = new socketio.Server(server.listener);
export const talkRoomMessageNameSpace = io.of("/talkRoomMessages");
export const applyingGroupNameSpace = io.of("/applying_group");
export const videoCallingNameSpace = io.of("/video_calling");

export const initializeServer = async () => {
  // @ts-ignore
  await server.register(AuthBearer); // authをプラグインとして登録する場合、routeの登録よりも先にしないと死ぬ

  server.auth.strategy("simple", "bearer-access-token", {
    validate: checkUserToken,
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
  // これまでルーティング作成のためだけにプラグイン作成してきたが、シンプルにルーティング定義するためだけにplugin設定する必要ない。
  blockesRoute(server);
  groupsRoute(server);
  applyingGroupsRoute(server);
  userAuthCodeRoute(server);
  videoCallingRoute(server);
  iapRoute(server);

  await server.initialize();

  return server;
};

export const startServer = async (server: Hapi.Server) => {
  cron.schedule("0 0 0 * * *", deleteExpiredViewedFlashes); // 毎日0時に実行
  cron.schedule(
    "0 0 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 * * *",
    verifyRecieptBatch
  );
  setupSocketIo();
  registerFirebaseAdmin();
  await server.start();
  console.log("🆗 サーバー起動: " + server.info.uri);
  return server;
};
