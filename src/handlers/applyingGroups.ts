import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { CreateApplyingGroupPayload } from "~/routes/applyingGroup/validator";
import { Artifacts } from "~/auth/bearer";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateApplyingGroupPayload;

  const applyingGroup = await prisma.applyingGroup.create({
    data: {
      applyingUserId: user.id,
      appliedUserId: payload.to,
    },
  });

  // ソケット発進
};

export const handlers = {
  create,
};
