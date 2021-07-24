import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("clientSignupToken", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });
  test("sample", async () => {
    const user = await prisma.user.findFirst();
    console.log(user);
    expect(user).toBeTruthy();
  });
});
