import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";

describe("sessions", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
  });

  describe("line", () => {
    describe("POST /sessions/lineLogin", () => {
      const url = "/sessions/lineLogin";

      test("headers", async () => {
        const res = await server.inject({
          method: "POST",
          url,
          headers: { Authorization: "Bearer ヘッダー" },
        });

        expect(res.statusCode).toEqual(200);
      });

      test("headerにAuthorizationがないと400が返る", async () => {
        const res = await server.inject({
          method: "POST",
          url,
        });

        expect(res.statusCode).toEqual(400);
      });
    });
  });
});
