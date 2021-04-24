import { initializeServer, startServer } from "./server";

const start = async () => {
  const instance = await initializeServer();
  await startServer(instance);
};

start();
