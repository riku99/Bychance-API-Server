import Hapi from "@hapi/hapi";

export const usersPlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/users",
  register: () => {},
};
