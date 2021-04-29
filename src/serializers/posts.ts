import { Post } from "@prisma/client";

import { formatDate } from "~/helpers/date";
import { ClientPost } from "~/types/clientData";

export const serializePost = ({ post }: { post: Post }): ClientPost => {
  const date = formatDate({ date: post.createdAt });
  const clientPost = {
    id: post.id,
    image: post.image,
    text: post.text,
    userId: post.userId,
    date,
  };

  return clientPost;
};
