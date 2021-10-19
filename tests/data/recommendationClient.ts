import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createRecommendationClient = async () => {
  return await prisma.recommendationClient.create({
    data: {
      uid: "uid",
    },
  });
};
