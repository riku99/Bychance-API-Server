import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { UpdateUserPayload } from "~/routes/users/validator";
import { serializeUser } from "~/serializers/users";
import { createS3ObjectPath } from "~/helpers/aws";

const prisma = new PrismaClient();

const updateUser = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const { deleteImage, ...userData } = req.payload as UpdateUserPayload;

  let newAvatar: string | null;

  if (userData.avatar) {
    const result = await createS3ObjectPath({
      data: userData.avatar,
      domain: "avatar",
      id: user.id,
      ext: "jpeg",
    });

    newAvatar = result ? result : user.avatar;
  } else {
    if (deleteImage) {
      newAvatar = null;
    } else {
      newAvatar = user.avatar;
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...user,
      ...userData,
      avatar: newAvatar,
    },
  });

  return serializeUser({ user: updatedUser });
};

export const usersHandler = {
  updateUser,
};
