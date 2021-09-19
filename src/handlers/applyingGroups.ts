import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import {
  CreateApplyingGroupPayload,
  DeleteApplyingGroupParams,
} from "~/routes/applyingGroup/validator";
import { Artifacts } from "~/auth/bearer";
import { applyingGroupNameSpace } from "~/server";
import { throwInvalidError } from "~/helpers/errors";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateApplyingGroupPayload;

  const applyingGroup = await prisma.applyingGroup.create({
    data: {
      applyingUserId: user.id,
      appliedUserId: payload.to,
    },
    select: {
      id: true,
      applyingUser: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  // ソケット発進
  applyingGroupNameSpace.to(payload.to).emit("applyGroup", {
    id: applyingGroup.id,
    applyingUser: {
      id: applyingGroup.applyingUser.id,
      name: applyingGroup.applyingUser.name,
      avatar: applyingGroup.applyingUser.avatar,
    },
  });

  return h.response().code(200);
};

const getAppliedGroups = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;

  const appliedGroups = await prisma.applyingGroup.findMany({
    where: {
      appliedUserId: user.id,
    },
    select: {
      id: true,
      applyingUser: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  return appliedGroups;
};

const _delete = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const params = req.params as DeleteApplyingGroupParams;

  const applyingGroup = await prisma.applyingGroup.findUnique({
    where: {
      id: Number(params.id),
    },
    select: {
      applyingUser: {
        select: {
          id: true,
        },
      },
      appliedUser: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!applyingGroup) {
    return throwInvalidError("既に存在しません");
  }

  if (
    applyingGroup.appliedUser.id !== user.id ||
    applyingGroup.applyingUser.id !== user.id
  ) {
    return throwInvalidError();
  }

  await prisma.applyingGroup.delete({
    where: {
      id: Number(params.id),
    },
  });

  return h.response().code(200);
};

export const handlers = {
  create,
  getAppliedGroups,
  _delete,
};
