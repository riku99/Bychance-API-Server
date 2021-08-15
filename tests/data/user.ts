import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const User = {
  id: "userId",
  name: "userName",
  lineId: "lineId",
  accessToken: "accessToken",
};

export const createUser = async () => {
  const result = await prisma.user.create({
    data: {
      ...User,
    },
  });

  return result;
};

export const createRamdomUser = async () => {
  const user = await prisma.user.create({
    data: {
      name: Math.random().toString(32).substring(2),
      lineId: Math.random().toString(32).substring(2),
      accessToken: Math.random().toString(32).substring(2),
    },
  });

  return user;
};
