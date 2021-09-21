import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { CreateGroupsPayload } from "~/routes/groups/validators";
import { Artifacts } from "~/auth/bearer";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateGroupsPayload;

  const newGroup = await prisma.group.create({
    data: {
      ownerId: payload.ownerId,
    },
  });

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      groupId: newGroup.id,
    },
  });

  await prisma.applyingGroup.deleteMany({
    where: {
      applyingUserId: user.id,
    },
  });

  return newGroup.id;
};

export const handlers = {
  create,
};
