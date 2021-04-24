import Hapi from "@hapi/hapi";

const root = async (server: Hapi.Server) => {
  server.route({
    method: "GET",
    path: "/",
    handler: (req, h) => {
      return "Hello World";
    },
  });
};

export const rootPlugin: Hapi.Plugin<undefined> = {
  name: "app/routes/root",
  register: root,
};
