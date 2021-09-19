import { PrismaClient } from "@prisma/client";

import { createHash } from "../src/helpers/crypto";

const prisma = new PrismaClient();

const createSampleUser = async () => {
  await prisma.user.create({
    data: {
      id: "sampleuserid",
      lineId: "lineId",
      accessToken: createHash("denzi"),
      login: true,
      name: "デンジ",
    },
  });
};

createSampleUser();
