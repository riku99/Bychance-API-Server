import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import { throwInvalidError } from "~/helpers/errors";

import {
  GetParams,
  CreatePayload,
} from "~/routes/recommendationClientNotification/validator";

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

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const payload = req.payload as CreatePayload;

  await prisma.recommendationClientNotification.create({
    data: {
      title: payload.title,
      text: payload.text,
    },
  });

  return h.response().code(200);
};

export const handlers = {
  getAll,
  getData,
  create,
};
