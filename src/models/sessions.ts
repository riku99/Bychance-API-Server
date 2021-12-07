import { prisma } from "~/lib/prisma";

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
      tooltipOfUsersDisplayShowed: true,
      groupsApplicationEnabled: true,
      videoCallingEnabled: true,
      backGroundItem: true,
      descriptionOfVideoCallingSettingsShowed: true,
      descriptionOfNotGettingTalkRoomMessageShowed: true,
      descriptionOfMyDisplayShowed: true,
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
