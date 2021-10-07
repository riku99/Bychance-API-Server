import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createPost = async ({ userId }: { userId: string }) => {
  return await prisma.post.create({
    data: {
      url: "url",
      userId,
    },
  });
};
