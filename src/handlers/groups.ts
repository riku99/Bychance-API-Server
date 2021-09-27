import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { CreateGroupsPayload } from "~/routes/groups/validators";
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

  if (!user.groupId) {
    return {
      presence: false,
    };
  }

  const groupData = await prisma.group.findUnique({
    where: {
      id: user.groupId,
    },
    select: {
      id: true,
      ownerId: true,
      members: {
        where: {
          id: {
            not: user.id,
          },
        },
        select: {
          id: true,
          avatar: true,
        },
      },
    },
  });

  if (!groupData) {
    // userにgroupIdが存在してもGroupが存在しなかった場合groupIdを削除
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        groupId: null,
      },
    });

    return {
      presence: false,
    };
  }

  const members = [{ id: user.id, avatar: user.avatar }, ...groupData.members]; // リクエストしたユーザーのデータは最初にいれる

  return {
    presence: true,
    id: groupData.id,
    members,
    ownerId: groupData.ownerId,
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
