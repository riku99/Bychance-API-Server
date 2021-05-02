import Hapi from "@hapi/hapi";

import { flashesRoute } from "~/routes/flashes";

export const flashesPlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/flashes",
  register: flashesRoute,
};
