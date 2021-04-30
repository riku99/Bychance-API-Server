import Hapi from "@hapi/hapi";

export const root = async (server: Hapi.Server) => {
  server.route({
    method: "GET",
    path: "/",
    handler: (req, h) => {
      return "Hello World";
    },
    options: {
      auth: false,
    },
  });
};
