import { PrismaClient } from "@prisma/client";

import { serializePost } from "~/serializers/post";
import { serializeTalkRoom } from "~/serializers/talkRoom";

const prisma = new PrismaClient();

const runSeed = async () => {
  // ユニークなカラムの被りが出ないように最初に消す
  // 依存関係に気をつけて消す
  await prisma.post.deleteMany({});
  await prisma.talkRoomMessage.deleteMany({});
  await prisma.talkRoom.deleteMany({});
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

  const user2 = await prisma.user.create({
    data: {
      lineId: "ハッシュ化されたlineId2",
      name: "アキ",
      accessToken: "ハッシュ化されたaccessToken2",
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

  const talkRoom = await prisma.talkRoom.create({
    data: {
      sender: {
        connect: { id: user.id },
      },
      recipient: {
        connect: { id: user2.id },
      },
    },
  });

  for (let i = 1; i <= 5; i++) {
    let m: string;
    switch (i) {
      case 1:
        m = "久しぶり";
        break;
      case 2:
        m = "どうしたの?";
        break;
      case 3:
        m = "今電話できる?";
        break;
      case 4:
        m = "なんで?";
        break;
      case 5:
        m = "話したいことある";
        break;
    }
    await prisma.talkRoomMessage.create({
      data: {
        text: m!,
        user: {
          connect: { id: i % 2 !== 0 ? user.id : user2.id },
        },
        room: {
          connect: { id: talkRoom.id },
        },
      },
    });
  }

  const data = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      senderTalkRooms: {
        include: {
          messages: true,
          readTalkRoomMessages: true,
        },
      },
      recipientTalkRooms: {
        include: {
          messages: true,
          readTalkRoomMessages: true,
        },
      },
    },
  });

  await prisma.flash.create({
    data: {
      source: "sourceURL",
      sourceType: "image",
      user: {
        connect: { id: user.id },
      },
    },
  });

  //const sr = [...data!.senderTalkRooms, ...data!.recipientTalkRooms];

  // const srResult = sr.map((_sr) => {
  //   const { messages, readTalkRoomMessages, ...rest } = _sr;
  //   return serializeTalkRoom({
  //     talkRoom: rest,
  //     talkRoomMessages: messages,
  //     readTalkRoomMessages,
  //     userId: user2.id,
  //   });
  // });

  //console.log(srResult);

  const allData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      posts: true,
      senderTalkRooms: true,
      recipientTalkRooms: true,
      talkRoomMessages: true,
      flashes: true,
    },
  });

  console.log(allData);

  // const withPost = await prisma.user.findUnique({
  //   where: {
  //     id: user.id,
  //   },
  //   select: {
  //     ...clientUserSelector,
  //     posts: true,
  //   },
  // });

  // console.log(user);
  // console.log(serializePost({ post }));
  // console.log(withPost);
};

runSeed()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
