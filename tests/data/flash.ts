import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createFlash = async ({ userId }: { userId: string }) => {
  return await prisma.flash.create({
    data: {
      userId,
      source: "url",
      sourceType: "image",
    },
  });
};
