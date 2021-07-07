import Hapi from "@hapi/hapi";

import { recommendationClientsRoute } from "~/routes/recommendationClients";

export const recommendationClientsPlugin: Hapi.Plugin<undefined> = {
  name: "app/route/recommendationClients",
  register: recommendationClientsRoute,
};
