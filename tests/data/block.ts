import { prisma } from "../lib/prisma";

export const createBlock = async ({
  blockBy,
  blockTo,
}: {
  blockBy: string;
  blockTo: string;
}) => {
  return await prisma.block.create({
    data: {
      blockBy,
      blockTo,
    },
  });
};
