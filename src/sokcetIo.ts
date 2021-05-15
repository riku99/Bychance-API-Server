import { talkRoomMessageNameSpace } from "~/server";

export const setupSocketIo = () => {
  talkRoomMessageNameSpace.on("connection", async (socket) => {
    const query = socket.handshake.query;
    if (!query) {
      return;
    }
    await socket.join(query.id as string); // ユーザーのidでソケット通信ができるようにjoinしてroomを作成

    // clientが明示的にdisconnectした場合(ログアウトとか)はサーバー側で何かしなくてもsocketは切断される。なのでとりあえずサーバ側からは何もしない
    //socket.on("disconnect", async () => {});
  });
};
