import Hapi from "@hapi/hapi";

import { initializeServer } from "~/server";
import { baseUrl } from "~/constants";
import { prisma } from "../../lib/prisma";
import { createUser } from "../../data/user";
import { createFlash } from "../../data/flash";
import { createFlashStamp } from "../../data/flashStamps";
import { EROFS } from "node:constants";

const url = (flashId: number) => `${baseUrl}/flashes/${flashId}/stamps`;

const deleteData = async () => {
  await prisma.flashStamp.deleteMany();
  await prisma.flash.deleteMany();
  await prisma.user.deleteMany();
};

describe("対象のFlashStampsの取得 GET /flashes/${flashId}/stamps", () => {
  let server: Hapi.Server;

  beforeAll(async () => {
    server = await initializeServer();
  });

  beforeEach(async () => {
    await deleteData();
  });

  afterAll(async () => {
    await deleteData();
  });

  test("対象のスタンプを全て取得する", async () => {
    const value = "yusyo";
    const value2 = "itibann";
    //　requestUserが作成したFlashにstampCreatorがスタンプを押した状況
    const requestUser = await createUser();
    const stampCreator = await createUser();
    const flash = await createFlash({ userId: requestUser.id });
    await createFlashStamp({
      userId: stampCreator.id,
      flashId: flash.id,
      value,
    });

    await createFlashStamp({
      userId: stampCreator.id,
      flashId: flash.id,
      value: value2,
    });

    const res = await server.inject({
      method: "GET",
      url: url(flash.id),
      auth: {
        artifacts: requestUser,
        strategy: "simple",
        credentials: {},
      },
    });

    const payload = JSON.parse(res.payload);

    expect(res.statusCode).toEqual(200);
    expect(payload[value]).toEqual({ userIds: [stampCreator.id] });
    expect(payload[value2]).toEqual({ userIds: [stampCreator.id] });
  });
});
