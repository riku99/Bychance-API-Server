import Hapi from "@hapi/hapi";

import { usersRoute } from "~/routes/users";

export const usersPlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/users",
  register: usersRoute,
};
