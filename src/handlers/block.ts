import Hapi from "@hapi/hapi";
import { PrismaClient } from "prisma/prisma-client";

import { CreatePaylaod, DeleteParams } from "~/routes/block/validator";
import { Artifacts } from "~/auth/bearer";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const paylad = req.payload as CreatePaylaod;

  await prisma.block.create({
    data: {
      blockBy: user.id,
      blockTo: paylad.blockTo,
    },
  });

  return h.response().code(200);
};

const _delete = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const params = req.params as DeleteParams;

  await prisma.block.delete({
    where: {
      blockBy_blockTo: {
        blockBy: user.id,
        blockTo: params.userId,
      },
    },
  });

  return h.response().code(200);
};

export const handlers = {
  create,
  _delete,
};
