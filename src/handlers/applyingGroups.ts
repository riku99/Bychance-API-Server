import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import {
  CreateApplyingGroupPayload,
  DeleteApplyingGroupParams,
  GetApplyingGroupsQuery,
} from "~/routes/applyingGroup/validator";
import { Artifacts } from "~/auth/bearer";
import { applyingGroupNameSpace } from "~/server";
import { throwInvalidError } from "~/helpers/errors";
import { isBlockingOrBlocked } from "~/db/query/users";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateApplyingGroupPayload;

  const existing = await prisma.applyingGroup.findUnique({
    where: {
      applyingUserId_appliedUserId: {
        applyingUserId: user.id,
        appliedUserId: payload.to,
      },
    },
  });

  // 申請の重複は禁止
  if (existing) {
    return throwInvalidError("既に申請中です");
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id: payload.to,
    },
    select: {
      id: true,
      groupsApplicationEnabled: true,
      groupId: true,
      blocks: {
        where: {
          blockTo: user.id,
        },
      },
      blocked: {
        where: {
          blockBy: user.id,
        },
      },
    },
  });

  if (!targetUser) {
    return throwInvalidError();
  }

  // 申請した相手が既にグループにいる場合は申請できない
  if (targetUser.groupId) {
    return throwInvalidError("相手ユーザーが既にグループに入っています");
  }

  if (targetUser.blocked.length) {
    return throwInvalidError(
      "このユーザーをブロックしています。申請するにはブロックを解除してください",
      true
    );
  }
  // 「ブロックされている側」の時でも作成はする。のでここでリターンはしない。 if (targetUser.blocks.length) {}

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

  // ソケット発射
  if (!targetUser.blocks.length && targetUser.groupsApplicationEnabled) {
    applyingGroupNameSpace.to(payload.to).emit("applyGroup", {
      id: applyingGroup.id,
      applyingUser: {
        id: applyingGroup.applyingUser.id,
        name: applyingGroup.applyingUser.name,
        avatar: applyingGroup.applyingUser.avatar,
      },
    });
  }

  return h.response().code(200);
};

const get = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const query = req.query as GetApplyingGroupsQuery;

  if (query.type === "applied" && !user.groupsApplicationEnabled) {
    return [];
  }

  const blocks = await prisma.block.findMany({
    where: {
      blockBy: user.id,
    },
    select: {
      blockTo: true,
    },
  });

  let groups: {
    id: number;
    applyingUser?: {
      id: string;
      name: string;
      avatar: string | null;
    };
    appliedUser?: {
      id: string;
      name: string;
      avatar: string | null;
    };
  }[];

  if (query.type && query.type === "applied") {
    groups = await prisma.applyingGroup.findMany({
      where: {
        appliedUserId: user.id,
        applyingUserId: {
          notIn: blocks.map((b) => b.blockTo), // ブロックしているユーザーが申請している場合は取得しない
        },
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
  } else {
    groups = await prisma.applyingGroup.findMany({
      where: {
        applyingUserId: user.id,
      },
      select: {
        id: true,
        appliedUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  return groups;
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
    return throwInvalidError("既に申請されていません");
  }

  if (
    applyingGroup.appliedUser.id !== user.id &&
    applyingGroup.applyingUser.id !== user.id
  ) {
    return throwInvalidError();
  }

  const g = await prisma.applyingGroup.delete({
    where: {
      id: Number(params.id),
    },
  });

  return g.id;
};

export const handlers = {
  create,
  get,
  _delete,
};
