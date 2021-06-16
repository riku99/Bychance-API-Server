import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { throwInvalidError } from "~/helpers/errors";
import { CreatePrivateTimePayload } from "~/routes/privateTime/validator";

const prisma = new PrismaClient();

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

  await prisma.privateTime.create({
    data: {
      startHours,
      startMinutes,
      endHours,
      endMinutes,
      userId: user.id,
    },
  });

  return h.response().code(200);
};

export const privateTimeHandler = {
  createPrivateTime,
};
