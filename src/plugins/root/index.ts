import Hapi from "@hapi/hapi";

import { root } from "~/routes/root";

export const rootPlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/root",
  register: root,
};
