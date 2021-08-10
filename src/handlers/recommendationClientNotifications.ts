import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import { throwInvalidError } from "~/helpers/errors";

import { GetParams } from "~/routes/recommendationClientNotification/validator";

const prisma = new PrismaClient();

const getAll = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const notifications = await prisma.recommendationClientNotification.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return notifications;
};

const getData = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const params = req.params as GetParams;

  const text = await prisma.recommendationClientNotification.findUnique({
    where: {
      id: Number(params.id),
    },
  });

  if (!text) {
    return throwInvalidError("データが存在しません");
  }

  return text;
};

export const handlers = {
  getAll,
  getData,
};
