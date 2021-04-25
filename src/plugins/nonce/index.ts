import Hapi from "@hapi/hapi";

import { nonce } from "~/routes/nonce";

export const noncePlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/nonce",
  register: nonce,
};
