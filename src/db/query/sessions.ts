import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getLoginData = async (id: string) =>
  prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      introduce: true,
      backGroundItem: true,
      backGroundItemType: true,
      instagram: true,
      twitter: true,
      youtube: true,
      tiktok: true,
      videoEditDescription: true,
      statusMessage: true,
      lat: true,
      lng: true,
      display: true,
      talkRoomMessageReceipt: true,
      showReceiveMessage: true,
      intro: true,
      displayedToolTipAboutUserDisplay: true,
      posts: {
        orderBy: {
          createdAt: "desc",
        },
      },
      flashes: {
        include: {
          viewed: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });
