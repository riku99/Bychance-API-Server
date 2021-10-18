import { prisma } from "../lib/prisma";

export const createGroup = async ({ ownerId }: { ownerId: string }) => {
  return await prisma.group.create({
    data: {
      ownerId,
    },
  });
};
