import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const create = async ({ nonce }: { nonce: string }) => {
  const result = await prisma.nonce.create({
    data: {
      nonce,
    },
  });

  return result;
};

export const Nonce = {
  create,
};
