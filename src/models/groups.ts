import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const groupMemberWhoBlockTargetUserExists = async ({
  groupId,
  requestUserId,
  targetUserId,
}: {
  groupId: string;
  requestUserId: string;
  targetUserId: string;
}) => {
  const requestUserGroupData = await prisma.group.findUnique({
    where: {
      id: groupId,
    },
    select: {
      members: {
        where: {
          blocks: {
            some: {
              blockTo: targetUserId,
              NOT: {
                blockBy: requestUserId, // グループのメンバーに自分は入れない
              },
            },
          },
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (requestUserGroupData && requestUserGroupData.members.length) {
    return true;
  } else {
    return false;
  }
};
