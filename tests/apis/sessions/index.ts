import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";
import { createErrorObj } from "~/helpers/errors";

describe("sessions", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
  });

  describe("line", () => {
    describe("POST /sessions/lineLogin", () => {
      const url = "/sessions/lineLogin";

      describe("headersが適切に指定されている", () => {
        describe("lineAPIの検証が成功", () => {
          describe("Userが既に存在する", () => {
            // test("200と既存のデータを返す", async () => {
            //   const res = await server.inject({
            //     method: "POST",
            //     url,
            //     headers: { Authorization: "Bearer ヘッダー" },
            //   });
            //   expect(res.statusCode).toEqual(200);
            // });
          });

          describe("Userがその時点で存在せず、新規である", () => {
            test("200と新規データを返す", async () => {});
          });

          test("nonceが存在しないので400とloginErrorを返す", async () => {});
        });

        describe("lineApiの検証が失敗", () => {
          test("400とloginErrorを返す", async () => {
            const res = await server.inject({
              method: "POST",
              url,
              headers: { Authorization: "Bearer ヘッダー" },
            });

            expect(res.statusCode).toEqual(400);
            expect(JSON.parse(res.payload)).toEqual(
              createErrorObj({ name: "loginError" })
            );
          });
        });
      });

      describe("headersが指定されていない", () => {
        test("Authorizationがないと400が返る", async () => {
          const res = await server.inject({
            method: "POST",
            url,
          });

          expect(res.statusCode).toEqual(400);
        });
      });
    });
  });
});
