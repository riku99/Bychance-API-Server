import Hapi from "@hapi/hapi";

import { sessionsRoute } from "~/routes/sessions";

export const sesisonsPlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/sessions",
  register: sessionsRoute,
};
