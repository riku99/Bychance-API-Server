import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { CreateDeleteTalkRoomPayload } from "~/routes/deleteTalkRooms/validator";

const prisma = new PrismaClient();

// 名前わかりづらいけど DeleteTalkRoom というデータを作成する、という意味
const createDeleteTalkRoom = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateDeleteTalkRoomPayload;

  await prisma.deleteTalkRoom.create({
    data: {
      talkRoomId: payload.talkRoomId,
      userId: user.id,
    },
  });

  return h.response().code(200);
};

export const deleteTalkRoomsHandler = {
  createDeleteTalkRoom,
};
