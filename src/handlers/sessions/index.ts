import Hapi from "@hapi/hapi";
import axios, { AxiosResponse } from "axios";
import { PrismaClient } from "@prisma/client";

import { createHash, createRandomString } from "~/helpers/crypto";
import { LineLoginHeaders } from "~/routes/sessions/validator";
import { throwLoginError } from "~/helpers/errors";
import { createClientData } from "~/helpers/clientData";
import { userIncludes } from "~/prisma/includes/users";
import { Artifacts } from "~/auth/bearer";

const prisma = new PrismaClient();

const lineLogin = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const headers = req.headers as LineLoginHeaders;
  const token = headers.authorization.split(" ")[1]; // Bearer取り出し
  const body = `id_token=${token}&client_id=${process.env.ChannelId}`; // x-www-form-urlencodedに形成
  let res: AxiosResponse<any>;

  try {
    res = await axios.post("https://api.line.me/oauth2/v2.1/verify", body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  } catch (err) {
    console.log(err);
    throwLoginError();
    return;
  }

  const nonce = res!.data.nonce as string;
  const existingNonce = await prisma.nonce.findUnique({
    where: { nonce },
  });

  if (!existingNonce) {
    throwLoginError();
    return;
  } else {
    await prisma.nonce.delete({ where: { nonce } });
  }

  const lineId = res!.data.sub as string;
  const hashedLineId = createHash(lineId); // lineIdのDBへの保存はハッシュ化

  const existingUser = await prisma.user.findFirst({
    where: { lineId: hashedLineId },
  });

  const accessToken = createRandomString(); // ユーザー側で保存
  const hashededAccessToken = createHash(accessToken); // DBに保存

  const name = res!.data.name;
  const avatar = res!.data.picture ? (res!.data.picture as string) : null;

  const user = existingUser
    ? // userが存在する場合はそれを返す
      await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          accessToken: hashededAccessToken,
        },
        include: userIncludes.forCreateClient,
      })
    : // 新規の場合は新たに作成
      await prisma.user.create({
        data: {
          lineId: hashedLineId,
          accessToken: hashededAccessToken,
          name,
          avatar,
        },
        include: userIncludes.forCreateClient,
      });

  const {
    posts,
    flashes,
    senderTalkRooms,
    recipientTalkRooms,
    talkRoomMessages,
    readTalkRoomMessages,
    viewedFlashes,
    ...rest
  } = user;

  const clientData = createClientData({
    user: rest,
    posts,
    flashes,
    talkRoomMessages,
    readTalkRoomMessages,
    viewedFlashes,
    senderTalkRooms,
    recipientTalkRooms,
  });

  return { ...clientData, accessToken };
};

export const sessionLogin = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;

  const data = await prisma.user.findUnique({
    where: { id: user.id },
    include: userIncludes.forCreateClient,
  });

  const {
    posts,
    flashes,
    senderTalkRooms,
    recipientTalkRooms,
    talkRoomMessages,
    readTalkRoomMessages,
    viewedFlashes,
    ...rest
  } = data!;

  return createClientData({
    user: rest,
    posts,
    flashes,
    talkRoomMessages,
    readTalkRoomMessages,
    viewedFlashes,
    senderTalkRooms,
    recipientTalkRooms,
  });
};

const sampleLogin = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const data = await prisma.user.findUnique({
    where: { id: "5b9a9b57-d497-4dd5-b257-cd5d10c2ea40" },
    include: userIncludes.forCreateClient,
  });

  console.log(data);

  const {
    posts,
    flashes,
    senderTalkRooms,
    recipientTalkRooms,
    talkRoomMessages,
    readTalkRoomMessages,
    viewedFlashes,
    ...rest
  } = data!;

  const clientData = createClientData({
    user: rest,
    posts,
    flashes,
    talkRoomMessages,
    readTalkRoomMessages,
    viewedFlashes,
    senderTalkRooms,
    recipientTalkRooms,
  });

  return {
    ...clientData,
    accessToken: "denzi",
  };
};

export const sessionsHandler = {
  lineLogin,
  sessionLogin,
  sampleLogin,
};
