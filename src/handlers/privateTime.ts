import Hapi from "@hapi/hapi";
import { nowJST, prisma } from "~/lib/prisma";
import { Artifacts } from "~/auth/bearer";
import { throwInvalidError } from "~/helpers/errors";
import {
  CreatePrivateTimePayload,
  DeletePrivateTimeParams,
} from "~/routes/privateTime/validator";

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
      createdAt: nowJST,
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

const deletePrivateTime = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const params = req.params as DeletePrivateTimeParams;

  const result = await prisma.privateTime.deleteMany({
    where: {
      id: Number(params.id),
      userId: user.id,
    },
  });

  if (!result.count) {
    return throwInvalidError();
  }

  return h.response().code(200);
};

export const privateTimeHandler = {
  createPrivateTime,
  getPrivateTime,
  deletePrivateTime,
};
