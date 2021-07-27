import Hapi from "@hapi/hapi";

import { recommendationClientNotificationRoute } from "~/routes/recommendationClientNotification";

export const recommendationClientNotificationsPlugin: Hapi.Plugin<undefined> = {
  name: "app/route/recommendationClientNotificatoins",
  register: recommendationClientNotificationRoute,
};
