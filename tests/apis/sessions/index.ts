import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";

describe("sessions", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
  });

  describe("line", () => {
    describe("POST /sessions/lineLogin", () => {
      test("headers", async () => {
        const res = await server.inject({
          method: "POST",
          url: "/sessions/lineLogin",
          headers: { Authorization: "Bearer ヘッダー" },
        });

        console.log(res.statusCode);
        expect(res.statusCode).toEqual(200);
      });
    });
  });
});
