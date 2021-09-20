import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const isBlockingOrBlocked = async ({
  userId,
  targetUserId,
}: {
  userId: string;
  targetUserId: string;
}) => {
  const blockData = await prisma.block.findMany({
    where: {
      OR: [
        {
          blockBy: userId,
          blockTo: targetUserId,
        },
        {
          blockBy: targetUserId,
          blockTo: userId,
        },
      ],
    },
  });

  if (!blockData.length) {
    return false;
  }

  const blocking = blockData.some((b) => b.blockBy === userId);
  const blocked = blockData.some((b) => b.blockTo === userId);

  return {
    blocking,
    blocked,
  };
};
