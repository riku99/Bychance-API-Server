import { Post } from "@prisma/client";

import { formatDate } from "~/helpers/date";

export type ClientPost = Pick<Post, "id" | "image" | "text" | "userId"> & {
  date: string;
};

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
