import Hapi from "@hapi/hapi";
import { nowJST, prisma } from "~/lib/prisma";
import {
  CreatePaylaod,
  DeleteParams,
  GetGroupMembersBlockTargetUserParams,
} from "~/routes/block/validator";
import { Artifacts } from "~/auth/bearer";
import { groupMemberWhoBlockTargetUserExists } from "~/models/groups";

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const paylad = req.payload as CreatePaylaod;

  await prisma.block.create({
    data: {
      blockBy: user.id,
      blockTo: paylad.blockTo,
      createdAt: nowJST,
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

// グループメンバーに対象のユーザーをブロックしているユーザーがいるかどうか
const getGroupMemberWhoBlcokTargetUserExists = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const requestUser = req.auth.artifacts as Artifacts;
  const params = req.params as GetGroupMembersBlockTargetUserParams;

  if (!requestUser.groupId) {
    return false;
  }

  const result = await groupMemberWhoBlockTargetUserExists({
    groupId: requestUser.groupId,
    requestUserId: requestUser.id,
    targetUserId: params.userId,
  });

  return result;
};

export const handlers = {
  create,
  _delete,
  getGroupMemberWhoBlcokTargetUserExists,
};
