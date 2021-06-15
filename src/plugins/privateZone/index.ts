import Hapi from "@hapi/hapi";

import { privateZoneRoute } from "~/routes/privateZone";

export const privateZonePlugin: Hapi.Plugin<undefined> = {
  name: "app/route/privateZone",
  register: privateZoneRoute,
};
