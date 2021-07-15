import Hapi from "@hapi/hapi";

import { recommendationsRoute } from "~/routes/recommendations";

export const recommendationsPlugin: Hapi.Plugin<undefined> = {
  name: "app/route/recommendations",
  register: recommendationsRoute,
};
