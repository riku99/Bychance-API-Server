import { PrismaClient, User as UserType } from "@prisma/client";

const prisma = new PrismaClient();

const findFirstByLineId = async ({ lineId }: { lineId: string }) => {
  const result = await prisma.user.findFirst({
    where: { lineId },
  });

  return result;
};

const create = async (
  data: Pick<UserType, "lineId" | "name" | "accessToken" | "avatar">
) => {
  const result = await prisma.user.create({
    data,
  });

  return result;
};

export const User = {
  findFirstByLineId,
  create,
};
