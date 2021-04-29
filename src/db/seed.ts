import { PrismaClient } from "@prisma/client";

import { clientUserSelector } from "~/serializers/users";
import { serializePost } from "~/serializers/posts";

const prisma = new PrismaClient();

const runSeed = async () => {
  // ユニークなカラムの被りが出ないように最初に消す
  await prisma.post.deleteMany({}); // 依存関係に気をつけて消す
  await prisma.user.deleteMany({});

  const user = await prisma.user.create({
    data: {
      lineId: "ハッシュ化されたlineId",
      name: "マキマ",
      accessToken: "ハッシュ化されたaccessToken",
      lat: "暗号化された緯度",
      lng: "暗号化された経度",
    },
  });

  const post = await prisma.post.create({
    data: {
      image: "imageURL",
      text: "テキスト",
      user: {
        connect: { id: user.id },
      },
    },
  });

  const withPost = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      ...clientUserSelector,
      posts: true,
    },
  });

  console.log(user);
  console.log(serializePost({ post }));
  console.log(withPost);
};

runSeed()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
