// テストで使用するため初期化までされたサーバーが必要なので初期化と起動でプロセス分ける

import Hapi from "@hapi/hapi";
import AuthBearer from "hapi-auth-bearer-token";
import socketio from "socket.io";
import * as admin from "firebase-admin";

import { checkBeareAccessToken } from "~/auth/bearer";
import { throwLoginError } from "~/helpers/errors";
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
import { deleteTalkRoomsPlugin } from "~/plugins/deleteTalkRooms";

const server = Hapi.server({
  port: 4001,
  // host: "localhost", // このコメントされてる2つ含めるとwsがうまく動かないのでいったん外す
  // debug: false,
});

export const io = new socketio.Server(server.listener);

io.on("connection", (socket) => {
  socket.join(socket.handshake.query.id as string); // ユーザーのidでソケット通信ができるようにjoinしてroomを作成
});

const c = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
console.log(c);

// サーバーからFCMを動かすためのデモ
const pushFromServer = async () => {
  const deviceToken = process.env.MY_DEVICE_TOKEN as string;
  const r = await admin.messaging().send({
    token: deviceToken,
    notification: {
      body: "返信しよう!",
      title: "メッセージを受け取りました",
    },
  });
  console.log(r);
  console.log("end");
};
pushFromServer();

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
    viewedFlashesPlugin,
    nearbyUsersPlugin,
    talkRoomsPlugin,
    talkRoomMessagesPlugin,
    readTalkRoomMessagesPlugin,
    deleteTalkRoomsPlugin,
  ]);

  await server.initialize();

  return server;
};

export const startServer = async (server: Hapi.Server) => {
  await server.start();
  console.log("サーバー起動: " + server.info.uri);

  return server;
};
