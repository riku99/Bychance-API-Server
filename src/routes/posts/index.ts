import Hapi from "@hapi/hapi";

import { baseUrl } from "~/constants/url";
import { createPostValidator, deletePostValidator } from "./validator";
import { postHandler } from "~/handlers/posts";
import { maxBytes } from "~/config/apis/size";

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
          maxBytes,
          timeout: 20000,
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
