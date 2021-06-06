import Hapi from "@hapi/hapi";

import { flashStampsRoute } from "~/routes/flashStamps";

export const flashStampsPlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/flashStamps",
  register: flashStampsRoute,
};
