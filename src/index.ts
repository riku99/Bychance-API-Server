import Hapi from "@hapi/hapi";

const start = async () => {
  const server = Hapi.server({
    port: 4001,
    host: "localhost",
  });

  server.route({
    method: "GET",
    path: "/",
    handler: (req, h) => {
      return "Hello World";
    },
  });

  await server.start();

  console.log("サーバー起動: " + server.info.uri);
};

start();
