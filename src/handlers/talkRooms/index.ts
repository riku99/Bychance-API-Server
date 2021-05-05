import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { CreateTalkRoomPayload } from "~/routes/talkRooms/validator";

const prisma = new PrismaClient();

const createTalkRoom = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateTalkRoomPayload;

  const talkRooms = await prisma.talkRoom.findMany({
    where: {
      OR: [
        {
          senderId: user.id,
          recipientId: payload.partnerId,
        },
        {
          senderId: payload.partnerId,
          recipientId: user.id,
        },
      ],
    },
  });

  const existingTalkRoom = talkRooms.length ? talkRooms[0] : null;

  if (existingTalkRoom) {
    return {
      presence: true,
      roomId: existingTalkRoom.id,
      timestamp: existingTalkRoom.updatedAt.toString(),
    };
  }

  const newTalkRoom = await prisma.talkRoom.create({
    data: {
      senderId: user.id,
      recipientId: payload.partnerId,
    },
  });

  return {
    presence: false,
    roomId: newTalkRoom.id,
    timestamp: newTalkRoom.createdAt.toString(),
  };
};

export const talkRoomsHandler = {
  createTalkRoom,
};
