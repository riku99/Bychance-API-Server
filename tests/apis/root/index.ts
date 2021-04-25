import Hapi from "@hapi/hapi";
import { initializeServer } from "~/server";

describe("Hello World", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  test("Helo World", async () => {
    const res = await server.inject({
      method: "GET",
      url: "/",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.payload).toEqual("Hello World");
  });
});
