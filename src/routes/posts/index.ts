import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants/url";
import { createPostValidator, deletePostValidator } from "./validator";
import { postHandler } from "~/handlers/posts";

export const postsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/posts`,
      handler: postHandler.createPost,
      options: {
        validate: {
          payload: createPostValidator.validate.payload,
          failAction: createPostValidator.failAction,
        },
        payload: {
          maxBytes: 1000 * 1000 * 100, // 許容データサイズの変更
        },
      },
    },
    {
      method: "DELETE",
      path: `${baseUrl}/posts`,
      handler: postHandler.deletePost,
      options: {
        validate: {
          payload: deletePostValidator.validate.payload,
          failAction: deletePostValidator.failAction,
        },
      },
    },
  ]);
};
