import { talkRoomMessageNameSpace } from "~/server";

export const setupSocketIo = () => {
  talkRoomMessageNameSpace.on("connection", async (socket) => {
    await socket.join(socket.handshake.query.id as string); // ユーザーのidでソケット通信ができるようにjoinしてroomを作成
  });
};
