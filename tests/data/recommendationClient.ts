import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const recommendationClient = {
  id: "rrr",
  uid: "uid",
  name: "ジャック",
};

export const createRecommenadtionClient = async () => {
  await prisma.recommendationClient.create({
    data: recommendationClient,
  });
};
