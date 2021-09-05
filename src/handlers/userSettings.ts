import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { Artifacts } from "~/auth/bearer";
import { throwInvalidError } from "~/helpers/errors";
import {
  ChangeDisplayPaylaod,
  ChangeVideoEditDescriptionPayload,
  ChangeTalkRoomMessageReceipt,
  ChangeShowReceiveMessage,
  ChangeIntro,
} from "~/routes/userSettings/validator";

const prisma = new PrismaClient();

const changeDisplay = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as ChangeDisplayPaylaod;

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        display: payload.display,
      },
    });
  } catch {
    return throwInvalidError();
  }

  return h.response().code(200);
};

const changeVideoEditDescription = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as ChangeVideoEditDescriptionPayload;

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        videoEditDescription: payload.videoEditDescription,
      },
    });
  } catch {}

  return h.response().code(200);
};

const changeTalkRoomMessageReceipt = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as ChangeTalkRoomMessageReceipt;

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        talkRoomMessageReceipt: payload.receipt,
      },
    });
  } catch {}

  return h.response().code(200);
};

const changeShowReceiveMessage = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as ChangeShowReceiveMessage;

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      showReceiveMessage: payload.showReceiveMessage,
    },
  });

  return h.response().code(200);
};

const changeIntro = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as ChangeIntro;

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      intro: payload.intro,
    },
  });

  return h.response().code(200);
};

export const handlers = {
  changeDisplay,
  changeVideoEditDescription,
  changeTalkRoomMessageReceipt,
  changeShowReceiveMessage,
  changeIntro,
};
