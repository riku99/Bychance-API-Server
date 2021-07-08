import Hapi from "@hapi/hapi";

import { clientSignupTokenRoute } from "~/routes/clientSignupToken";

export const clientSignupTokenPlugin: Hapi.Plugin<undefined> = {
  name: "app/route/clientSignupToken",
  register: clientSignupTokenRoute,
};
