"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketIo = void 0;
const server_1 = require("~/server");
const setupSocketIo = () => {
    server_1.talkRoomMessageNameSpace.on("connection", async (socket) => {
        const query = socket.handshake.query;
        if (!query) {
            return;
        }
        await socket.join(query.id); // ユーザーのidでソケット通信ができるようにjoinしてroomを作成
        // clientが明示的にdisconnectした場合(ログアウトとか)はサーバー側で何かしなくてもsocketは切断される。なのでとりあえずサーバ側からは何もしない
        //socket.on("disconnect", async () => {});
    });
};
exports.setupSocketIo = setupSocketIo;
