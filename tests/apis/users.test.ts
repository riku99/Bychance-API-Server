import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { createHash } from "~/helpers/crypto";
import { createS3ObjectPath } from "~/helpers/aws";
import { UpdateUserPayload } from "~/routes/users/validator";

const prisma = new PrismaClient();

const accessToken = "accessToken";
const hashedAccessToken = createHash(accessToken);

const mockedImageUrl = "image url";
jest.mock("~/helpers/aws");
(createS3ObjectPath as any).mockResolvedValue({
  source: mockedImageUrl,
});

describe("users", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
    await prisma.user.deleteMany({});
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
  });

  describe("プロフィール編集, PATCH /users", () => {
    const url = `${baseUrl}/users`;

    test("payloadに渡したデータに更新される", async () => {
      const user = await prisma.user.create({
        data: {
          name: "大谷さん",
          lineId: "lineid",
          accessToken: "accessToken",
        },
      });

      const dataForUpdate: UpdateUserPayload = {
        name: "新大谷さん",
        avatar: "newAvatarUrl",
        introduce: "intro",
        avatarExt: "png",
        backGroundItem: "bgItem",
        backGroundItemType: "video",
        statusMessage: "m",
        deleteAvatar: false,
        deleteBackGroundItem: false,
        backGroundItemExt: "png",
        instagram: null,
        twitter: null,
        youtube: "youtube",
        tiktok: "toktok",
      };

      const res = await server.inject({
        method: "PATCH",
        url,
        auth: {
          strategy: "simple",
          credentials: {},
          artifacts: user,
        },
        payload: dataForUpdate,
      });

      const newUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      const { name, avatar, backGroundItem } = JSON.parse(res.payload);
      const resResult = { name, avatar, backGroundItem };
      expect(resResult).toEqual({
        name: "新大谷さん",
        avatar: mockedImageUrl,
        backGroundItem: mockedImageUrl,
      });
      expect(newUser?.name).toEqual("新大谷さん");
    });

    test("認可情報がない場合、401エラーを返す", async () => {
      await prisma.user.create({
        data: {
          name: "name",
          lineId: "lineID",
          accessToken: hashedAccessToken,
        },
      });

      const res = await server.inject({
        method: "PATCH",
        url,
      });

      expect(res.statusCode).toEqual(401);
    });

    test("認可情報が間違っている場合、401エラーを返す", async () => {
      await prisma.user.create({
        data: {
          name: "name",
          lineId: "lienId",
          accessToken: hashedAccessToken,
        },
      });

      const res = await server.inject({
        method: "PATCH",
        url: `${url}?id=ijijijiji`,
        headers: { Authorization: "Bearer WrongBearer" },
      });

      expect(res.statusCode).toEqual(401);
    });
  });
});
