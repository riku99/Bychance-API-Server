import { PostsWithIncludesItem } from "~/helpers/clientData";

import { serializePost } from "~/serializers/post";

export const createClientPosts = (posts: PostsWithIncludesItem) => {
  return posts.map((post) => serializePost({ post }));
};
