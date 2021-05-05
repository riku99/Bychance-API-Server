import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { CreatePostPayload, DeletePostPayload } from "~/routes/posts/validator";
import { serializePost } from "~/serializers/post";
import { createS3ObjectPath } from "~/helpers/aws";
import { throwInvalidError } from "~/helpers/errors";

const prisma = new PrismaClient();

const createPost = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreatePostPayload;

  const imageUrl = await createS3ObjectPath({
    data: payload.image,
    domain: "post",
    id: user.id,
  });

  const post = await prisma.post.create({
    data: {
      image: imageUrl,
      text: payload.text,
      user: {
        connect: { id: user.id },
      },
    },
  });

  return serializePost({ post });
};

const deletePost = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as DeletePostPayload;

  // 削除するのは一件だが、複数条件(id, userId)で削除したいためdeleteManyを使用
  // deleteUniqueだとuniuqeなカラム(POSTだとid)でしか指定できない
  // https://github.com/prisma/prisma/discussions/4185
  const result = await prisma.post.deleteMany({
    where: { id: payload.postId, userId: user.id },
  });

  if (!result.count) {
    return throwInvalidError();
  }

  return h.response().code(200);
};

export const postHandler = {
  createPost,
  deletePost,
};