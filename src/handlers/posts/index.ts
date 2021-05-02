import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { CreatePostPayload } from "~/routes/posts/validator";
import { serializePost } from "~/serializers/posts";
import { createS3ObjectPath } from "~/helpers/aws";

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

export const postHandler = {
  createPost,
};
