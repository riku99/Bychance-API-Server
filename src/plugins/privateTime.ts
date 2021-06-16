import Hapi from "@hapi/hapi";

import { privateTimeRoute } from "~/routes/privateTime";

export const privateTimePlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/privateTime",
  register: privateTimeRoute,
};
