import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { UpdateUserPayload } from "~/routes/users/validator";
import { serializeUser } from "~/serializers/users";

const prisma = new PrismaClient();

const updateUser = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const { deleteImage, ...userData } = req.payload as UpdateUserPayload;

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...user,
      ...userData,
    },
  });

  return serializeUser({ user: updatedUser });
};

export const usersHandler = {
  updateUser,
};
