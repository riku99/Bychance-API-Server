import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const get = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const notifications = await prisma.recommendationClientNotification.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return notifications;
};

export const handler = {
  get,
};
