import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const runSeed = async () => {
  // ユニークなカラムの被りが出ないように最初に消す
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      lineId: "lineIddayo",
      name: "お酢納豆食べたい",
      accessToken: "tokendesu",
      lat: "暗号化された緯度",
      lng: "暗号化された経度",
    },
  });

  console.log(user);
};

runSeed()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
