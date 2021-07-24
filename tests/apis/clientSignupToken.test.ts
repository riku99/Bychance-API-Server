import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { resetDatabase } from "../helpers";
import { clientSignupTokenPath } from "~/routes/clientSignupToken";
import { checkBeareFirebaseJWT } from "~/auth/bearer";
import { initializeServer } from "~/server";

const auth = require("~/auth/bearer");

const prisma = new PrismaClient();

jest.mock("~/auth/bearer");
(checkBeareFirebaseJWT as any).mockResolvedValue({
  isValid: true,
  credentials: {},
  artifacts: {
    name: "Admin User",
    admin: true,
  },
});

const postRequestSchema = {
  method: "POST",
  url: clientSignupTokenPath,
};

describe("clientSignupToken", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // beforeEach(async () => {
  //   console.log("beforeEach");
  //   await resetDatabase();
  // });

  test("sample", async () => {
    const user = await prisma.user.findFirst();
    console.log(user);
    expect(user).toBeNull();
  });

  describe("POST clientSignupTokenPath", () => {
    describe("adminユーザー", () => {
      test("トークンを作成してそのトークンを返す", async () => {
        jest.spyOn(auth, "checkBeareFirebaseJWT").mockImplementation(() => {
          return {
            isValid: true,
            credentials: {},
            artifacts: {
              name: "Admin User",
              admin: true,
            },
          };
        });

        const res = await server.inject(postRequestSchema);
        expect(res.statusCode).toEqual(200);
      });
    });

    describe("adminユーザーじゃない", () => {
      test("invalidエラーを返す", async () => {});
    });
  });
});
