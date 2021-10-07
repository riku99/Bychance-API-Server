import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const User = {
  id: "userId",
  name: "userName",
  lineId: "lineId",
  accessToken: "accessToken",
};

export const createUser = async (
  data?: Partial<Prisma.UserCreateArgs["data"]>
) => {
  const user = await prisma.user.create({
    data: {
      name: Math.random().toString(32).substring(2),
      lineId: Math.random().toString(32).substring(2),
      accessToken: Math.random().toString(32).substring(2),
      ...data,
    },
  });

  return user;
};
