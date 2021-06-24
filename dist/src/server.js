"use strict";
// テストで使用するため初期化までされたサーバーが必要なので初期化と起動でプロセス分ける
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.initializeServer = exports.talkRoomMessageNameSpace = exports.io = void 0;
const hapi_1 = __importDefault(require("@hapi/hapi"));
const hapi_auth_bearer_token_1 = __importDefault(require("hapi-auth-bearer-token"));
const socket_io_1 = __importDefault(require("socket.io"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const bearer_1 = require("~/auth/bearer");
const errors_1 = require("~/helpers/errors");
const sokcetIo_1 = require("~/sokcetIo");
const root_1 = require("~/plugins/root");
const prisma_1 = require("~/plugins/prisma");
const nonce_1 = require("~/plugins/nonce");
const sessions_1 = require("~/plugins/sessions");
const users_1 = require("~/plugins/users");
const posts_1 = require("~/plugins/posts");
const flashes_1 = require("~/plugins/flashes");
const viewedFlashes_1 = require("~/plugins/viewedFlashes");
const nearbyUsers_1 = require("~/plugins/nearbyUsers");
const talkRooms_1 = require("~/plugins/talkRooms");
const talkRoomMessages_1 = require("~/plugins/talkRoomMessages");
const readTalkRoomMessages_1 = require("~/plugins/readTalkRoomMessages");
const deviceToken_1 = require("~/plugins/deviceToken");
const flashStamps_1 = require("~/plugins/flashStamps");
const privateZone_1 = require("~/plugins/privateZone");
const privateTime_1 = require("~/plugins/privateTime");
const server = hapi_1.default.server({
    port: process.env.PORT || 4001,
    // host: "localhost", // このコメントされてる2つ含めるとwsがうまく動かないのでいったん外す
    // debug: false,
});
exports.io = new socket_io_1.default.Server(server.listener);
exports.talkRoomMessageNameSpace = exports.io.of("/talkRoomMessages");
sokcetIo_1.setupSocketIo();
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.applicationDefault(),
});
const initializeServer = async () => {
    // @ts-ignore
    await server.register(hapi_auth_bearer_token_1.default); // authをプラグインとして登録する場合、routeの登録よりも先にしないと死ぬ
    server.auth.strategy("simple", "bearer-access-token", {
        validate: bearer_1.checkBeareAccessToken,
        unauthorized: () => {
            // unauthorizedはtokenが存在しない場合、validateに渡した関数から{isValid: false}が返された場合に実行される
            console.log("認可失敗");
            errors_1.throwLoginError();
        },
    });
    server.auth.default("simple");
    await server.register({
        plugin: require("hapi-pino"),
        options: {
            prettyPrint: true,
            redact: ["req.headers.authorization"],
            logPayload: false,
            logQueryParams: true, // ログにクエリパラメータを出力
        },
    });
    await server.register([
        prisma_1.prismaPlugin,
        nonce_1.noncePlugin,
        root_1.rootPlugin,
        sessions_1.sesisonsPlugin,
        users_1.usersPlugin,
        posts_1.postsPlugin,
        flashes_1.flashesPlugin,
        viewedFlashes_1.viewedFlashesPlugin,
        nearbyUsers_1.nearbyUsersPlugin,
        talkRooms_1.talkRoomsPlugin,
        talkRoomMessages_1.talkRoomMessagesPlugin,
        readTalkRoomMessages_1.readTalkRoomMessagesPlugin,
        deviceToken_1.deviceTokenPlugin,
        flashStamps_1.flashStampsPlugin,
        privateZone_1.privateZonePlugin,
        privateTime_1.privateTimePlugin,
    ]);
    await server.initialize();
    return server;
};
exports.initializeServer = initializeServer;
const startServer = async (server) => {
    await server.start();
    console.log("サーバー起動: " + server.info.uri);
    return server;
};
exports.startServer = startServer;
