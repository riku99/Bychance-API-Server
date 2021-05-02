import Hapi from "@hapi/hapi";

import { viewedFlashesRoute } from "~/routes/viewedFlashes";

export const viewedFlashesPlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/viewedFlashes",
  register: viewedFlashesRoute,
};
