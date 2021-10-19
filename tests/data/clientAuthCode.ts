import { prisma } from "../lib/prisma";
import { create4digitNumber } from "~/utils";

export const createClientAuthCode = async ({
  clientId,
}: {
  clientId: string;
}) => {
  return prisma.clientAuthCode.create({
    data: {
      clientId,
      code: create4digitNumber(),
    },
  });
};
