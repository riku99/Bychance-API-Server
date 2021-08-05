import Hapi from "@hapi/hapi";

import { userHideRecommendationsRoute } from "~/routes/userHideRecommendations";

export const userHideRecommendatoinsPlugin: Hapi.Plugin<undefined> = {
  name: "app/route/userHideRecommendations",
  register: userHideRecommendationsRoute,
};
