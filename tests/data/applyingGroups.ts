import { prisma } from "../lib/prisma";

export const createApplyingGrop = async ({
  applyingUserId,
  appliedUserId,
}: {
  applyingUserId: string;
  appliedUserId: string;
}) => {
  return await prisma.applyingGroup.create({
    data: {
      applyingUserId,
      appliedUserId,
    },
  });
};
