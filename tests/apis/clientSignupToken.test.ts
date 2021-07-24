import { PrismaClient } from "@prisma/client";

import { resetDatabase } from "../helpers";

const prisma = new PrismaClient();

describe("clientSignupToken", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  test("sample", async () => {
    const user = await prisma.user.findFirst();
    console.log(user);
    expect(user).toBeNull();
  });
});
