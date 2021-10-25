import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const createFlashStamp = async ({
  flashId,
  userId,
  value,
}: {
  flashId: number;
  userId: string;
  value: Prisma.FlashStampCreateArgs["data"]["value"];
}) => {
  return await prisma.flashStamp.create({
    data: {
      value,
      flashId,
      userId,
    },
  });
};
