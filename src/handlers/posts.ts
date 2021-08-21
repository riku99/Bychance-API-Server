import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import {
  CreatePostPayload,
  DeletePostParams,
  GetUserPostsParams,
} from "~/routes/posts/validator";
import { createS3ObjectPath } from "~/helpers/aws";
import { throwInvalidError } from "~/helpers/errors";

const prisma = new PrismaClient();

const createPost = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreatePostPayload;

  const url = await createS3ObjectPath({
    data: payload.source,
    domain: "post",
    id: user.id,
    ext: payload.ext,
    sourceType: payload.sourceType,
  });

  if (!url) {
    return throwInvalidError();
  }

  const post = await prisma.post.create({
    data: {
      url: url.source,
      text: payload.text,
      sourceType: payload.sourceType,
      user: {
        connect: { id: user.id },
      },
    },
  });

  return post;
};

const deletePost = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const params = req.params as DeletePostParams;

  // 削除するのは一件だが、複数条件(id, userId)で削除したいためdeleteManyを使用
  // deleteUniqueだとuniuqeなカラム(POSTだとid)でしか指定できない。 https://github.com/prisma/prisma/discussions/4185
  const result = await prisma.post.deleteMany({
    where: { id: params.postId, userId: user.id },
  });

  if (!result.count) {
    return throwInvalidError();
  }

  return h.response().code(200);
};

const getUserPosts = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const params = req.params as GetUserPostsParams;

  const posts = await prisma.post.findMany({
    where: {
      userId: params.userId,
    },
    select: {
      id: true,
      text: true,
      url: true,
      createdAt: true,
      userId: true,
      sourceType: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return posts;
};

export const handlers = {
  createPost,
  deletePost,
  getUserPosts,
};
