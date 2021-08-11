import Hapi from "@hapi/hapi";

import { recommendationClientReadNotificationRoute } from "~/routes/recommendationClientReadNotifications";

export const recommendationClientReadNotificationPlugin: Hapi.Plugin<undefined> = {
  name: "app/route/recommendationClientReadNotificatoins",
  register: recommendationClientReadNotificationRoute,
};
