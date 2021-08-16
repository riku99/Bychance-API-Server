import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants";
import {
  createPostValidator,
  deletePostValidator,
  validators,
} from "./validator";
import { handlers } from "~/handlers/posts";
import { maxBytes } from "~/config/apis/size";

export const postsRoute = async (server: Hapi.Server) => {
  server.route([
    {
      method: "POST",
      path: `${baseUrl}/posts`,
      handler: handlers.createPost,
      options: {
        validate: {
          payload: createPostValidator.validate.payload,
          failAction: createPostValidator.failAction,
        },
        payload: {
          maxBytes,
          timeout: 20000,
        },
      },
    },
    {
      method: "DELETE",
      path: `${baseUrl}/posts/{postId}`,
      handler: handlers.deletePost,
      options: {
        validate: {
          params: deletePostValidator.validate.params,
          failAction: deletePostValidator.failAction,
        },
      },
    },
    {
      method: "GET",
      path: `${baseUrl}/users/{userId}/posts`,
      handler: handlers.getUserPosts,
      options: {
        validate: {
          params: validators.gets.validator.params,
          failAction: validators.gets.failAction,
        },
      },
    },
  ]);
};
