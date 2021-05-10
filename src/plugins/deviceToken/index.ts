import Hapi from "@hapi/hapi";

import { deviceTokenRoute } from "~/routes/deviceToken";

export const deviceTokenPlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/deviceToken",
  register: deviceTokenRoute,
};
