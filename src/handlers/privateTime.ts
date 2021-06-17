import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { throwInvalidError } from "~/helpers/errors";
import { CreatePrivateTimePayload } from "~/routes/privateTime/validator";

const prisma = new PrismaClient();

const getPrivateTime = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;

  const result = await prisma.privateTime.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      startHours: true,
      startMinutes: true,
      endHours: true,
      endMinutes: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const createPrivateTime = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const {
    startHours,
    startMinutes,
    endHours,
    endMinutes,
  } = req.payload as CreatePrivateTimePayload;

  const result = await prisma.privateTime.create({
    data: {
      startHours,
      startMinutes,
      endHours,
      endMinutes,
      userId: user.id,
    },
  });

  return {
    id: result.id,
    startHours: result.startHours,
    startMinutes: result.startMinutes,
    endHours: result.endHours,
    endMinutes: result.endMinutes,
  };
};

export const privateTimeHandler = {
  createPrivateTime,
  getPrivateTime,
};
