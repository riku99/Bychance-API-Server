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
