import Hapi from "@hapi/hapi";

import { nearbyUsersRoute } from "~/routes/nearbyUsers";

export const nearbyUsersPlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/nearbyUsers",
  register: nearbyUsersRoute,
};
