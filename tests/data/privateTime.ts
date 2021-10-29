import { prisma } from "../lib/prisma";

export const createPrivateTime = async ({
  userId,
  startHours,
  startMinutes,
  endHours,
  endMinutes,
}: {
  userId: string;
  startHours: number;
  startMinutes: number;
  endHours: number;
  endMinutes: number;
}) => {
  return await prisma.privateTime.create({
    data: {
      userId,
      startHours,
      startMinutes,
      endHours,
      endMinutes,
    },
  });
};
