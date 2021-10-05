import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createHash } from "~/helpers/crypto";
import { createS3ObjectPath } from "~/helpers/aws";

const prisma = new PrismaClient();

const accessToken = "accessToken";
const hashedAccessToken = createHash(accessToken);

const S3ObjectPathResult = "imageUrl";
jest.mock("~/helpers/aws");
(createS3ObjectPath as any).mockResolvedValue({
  source: S3ObjectPathResult,
});

describe("posts", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
  });

  beforeEach(async () => {
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe("Postの作成, POST /posts", () => {
    const url = `${baseUrl}/posts`;

    test("Postが作成される", async () => {
      const user = await prisma.user.create({
        data: {
          name: "name",
          lineId: "lineid",
          accessToken: hashedAccessToken,
        },
      });

      const res = await server.inject({
        method: "POST",
        url,
        auth: {
          strategy: "simple",
          credentials: {},
          artifacts: user,
        },
        payload: {
          text: "hey",
          source: "そーす",
          sourceType: "image",
          ext: "png",
        },
      });

      const newPost = await prisma.post.findFirst();

      expect(newPost).toBeTruthy();
      expect(JSON.parse(res.payload).url).toEqual(S3ObjectPathResult);
    });

    test("認可情報がないので401エラーを返す", async () => {
      const res = await server.inject({
        method: "POST",
        url,
      });

      expect(res.statusCode).toEqual(401);
    });

    test("認可情報が間違っているので401エラーを返す", async () => {
      const user = await prisma.user.create({
        data: {
          name: "name",
          lineId: "lineId",
          accessToken: hashedAccessToken,
        },
      });

      const res = await server.inject({
        method: "POST",
        url: `${url}?id=${user.id}`,
        headers: { Authorization: "BearerWrongBearer" },
      });

      expect(res.statusCode).toEqual(401);
    });
  });
});
