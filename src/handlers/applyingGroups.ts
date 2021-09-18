import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { CreateApplyingGroupPayload } from "~/routes/applyingGroup/validator";
import { Artifacts } from "~/auth/bearer";
import { applyingGroupNameSpace } from "~/server";

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

export const handlers = {
  create,
};
