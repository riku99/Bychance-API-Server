import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { createRandomString } from "~/helpers/crypto";

export const createSignupToken = async (
  data?: Partial<Prisma.ClientSignupTokenCreateArgs["data"]>
) => {
  return await prisma.clientSignupToken.create({
    data: {
      token: createRandomString().replace(/\//g, "w").slice(0, 8),
      ...data,
    },
  });
};
