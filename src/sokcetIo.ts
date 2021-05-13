import { talkRoomMessageNameSpace } from "~/server";

export const setupSocketIo = () => {
  talkRoomMessageNameSpace.on("connection", async (socket) => {
    const query = socket.handshake.query;
    if (!query) {
      socket.disconnect();
      return;
    }
    await socket.join(query.id as string); // ユーザーのidでソケット通信ができるようにjoinしてroomを作成
    socket.on("disconnect", async () => {
      socket.disconnect();
    });
  });
};
