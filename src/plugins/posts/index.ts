import Hapi from "@hapi/hapi";

import { postsRoute } from "~/routes/posts";

export const postsPlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/posts",
  register: postsRoute,
};
