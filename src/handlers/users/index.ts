import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import Boom from "@hapi/boom";

import { Artifacts } from "~/auth/bearer";
import {
  UpdateUserPayload,
  RefreshUserPayload,
} from "~/routes/users/validator";
import { serializeUser } from "~/serializers/users";
import { createS3ObjectPath } from "~/helpers/aws";
import { invalidErrorType } from "~/config/apis/errors";

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

const refreshUser = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as RefreshUserPayload;

  const refreshedUser = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!refreshedUser) {
    const error = Boom.badRequest();
    error.output.payload.message = "ユーザーが存在しません";
    error.output.payload.errorType = invalidErrorType;
    throw error;
  }

  // リフレッシュの対象が自分か他のユーザーかで処理分ける
  if (user.id === payload.userId) {
    const data = serializeUser({ user: refreshedUser });
    return {
      isMyData: true,
      data,
    };
  } else {
    // 他のユーザーの場合の処理
  }
};

export const usersHandler = {
  updateUser,
  refreshUser,
};
