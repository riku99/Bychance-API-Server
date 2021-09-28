import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import {
  CreateGroupsPayload,
  GetGroupsParams,
} from "~/routes/groups/validators";
import { Artifacts } from "~/auth/bearer";
import { throwInvalidError } from "~/helpers/errors";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateGroupsPayload;

  // 他のグループに所属状態である場合は新しいグループに入ることはできない
  if (user.groupId) {
    return throwInvalidError(
      "既にグループに所属しています。新しいグループに入るためには抜けてください。",
      true
    );
  }

  let groupId: string;

  const existingGroup = await prisma.group.findUnique({
    where: {
      ownerId: payload.ownerId,
    },
  });

  // オーナーユーザーのグループが既に存在する場合はそのグループに参加させる
  if (existingGroup) {
    groupId = existingGroup.id;
  } else {
    // オーナーユーザーのグループがまだ存在しない場合は新たにデータ作成
    const newGroup = await prisma.group.create({
      data: {
        ownerId: payload.ownerId,
      },
    });

    groupId = newGroup.id;
  }

  // 申請していた側も申請されていた側もをグループに所属させる
  await prisma.user.updateMany({
    where: {
      OR: [
        {
          id: user.id,
        },
        {
          id: payload.ownerId,
          groupId: null,
        },
      ],
    },
    data: {
      groupId,
    },
  });

  // グループに所属したら申請された側の申請中のもの、申請されているものはすべて消去
  await prisma.applyingGroup.deleteMany({
    where: {
      OR: [
        {
          applyingUserId: user.id,
        },
        {
          appliedUserId: user.id,
        },
      ],
    },
  });

  return groupId;
};

const get = async (req: Hapi.Request) => {
  const user = req.auth.artifacts as Artifacts;
  const params = req.params as GetGroupsParams;

  // 指定したユーザーのグループデータ取得
  const targetUser = await prisma.user.findUnique({
    where: {
      id: params.userId,
    },
    select: {
      id: true,
      avatar: true,
      group: {
        select: {
          id: true,
          ownerId: true,
          members: {
            select: {
              id: true,
              avatar: true,
            },
          },
        },
      },
      groupId: true,
    },
  });

  // そもそもユーザーがいない場合
  if (!targetUser) {
    return throwInvalidError();
  }

  // グループに入っていない
  if (!targetUser.group) {
    // 何らかの理由で「グループは存在しないのにgroupIdが存在する場合」はgroupIdを削除
    if (targetUser.groupId) {
      await prisma.user.update({
        where: {
          id: params.userId,
        },
        data: {
          groupId: null,
        },
      });
    }

    return {
      presence: false,
    };
  }

  // 対象のユーザーのデータは最初にいれる
  const members = [
    { id: targetUser.id, avatar: targetUser.avatar },
    ...targetUser.group.members.filter((m) => m.id !== targetUser.id),
  ];

  return {
    presence: true,
    id: targetUser.group.id,
    ownerId: targetUser.group.ownerId,
    members,
  };
};

const deleteGroup = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;

  if (!user.groupId) {
    return throwInvalidError();
  }

  const group = await prisma.group.findFirst({
    where: {
      id: user.groupId,
      ownerId: user.id,
    },
  });

  if (!group) {
    return throwInvalidError();
  }

  await prisma.user.updateMany({
    where: {
      groupId: user.groupId,
    },
    data: {
      groupId: null,
    },
  });

  await prisma.group.delete({
    where: {
      id: user.groupId,
    },
  });

  return h.response().code(200);
};

export const handlers = {
  create,
  get,
  deleteGroup,
};
