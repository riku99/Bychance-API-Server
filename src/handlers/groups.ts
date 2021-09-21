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

  const newGroup = await prisma.group.create({
    data: {
      ownerId: payload.ownerId,
    },
  });

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
      groupId: newGroup.id,
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

  return newGroup.id;
};

export const handlers = {
  create,
};
