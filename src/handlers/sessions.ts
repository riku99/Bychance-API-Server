import Hapi from "@hapi/hapi";
import axios, { AxiosResponse } from "axios";
import { PrismaClient } from "@prisma/client";

import {
  createHash,
  createRandomString,
  handleUserLocationCrypt,
} from "~/helpers/crypto";
import { LineLoginHeaders } from "~/routes/sessions/validator";
import { throwLoginError } from "~/helpers/errors";
import { createClientData } from "~/helpers/clientData";
import { createClientIncludes } from "~/prisma/includes";
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
        include: createClientIncludes,
      })
    : // 新規の場合は新たに作成
      await prisma.user.create({
        data: {
          lineId: hashedLineId,
          accessToken: hashededAccessToken,
          name,
          avatar,
        },
        include: createClientIncludes,
      });

  if (!user.login) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        login: true,
      },
    });
  }

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

  if (!user.login) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        login: true,
      },
    });
  }

  // const data = await prisma.user.findUnique({
  //   where: { id: user.id },
  //   include: createClientIncludes,
  // });

  const data = await prisma.user.findUnique({
    where: {
      id: user.id,
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
      posts: {
        orderBy: {
          createdAt: "desc",
        },
      },
      flashes: {
        include: {
          stamps: true,
          viewed: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!data) {
    return throwLoginError();
  }

  const { posts, flashes, ...userData } = data;
  const { lat, lng, ...restUserData } = userData;
  let decryptedLat: number | null = null;
  let decryptedLng: number | null = null;
  if (lat && lng) {
    const { lat: _lat, lng: _lng } = handleUserLocationCrypt(
      lat,
      lng,
      "decrypt"
    );

    decryptedLat = _lat;
    decryptedLng = _lng;
  }

  const response = {
    user: {
      ...restUserData,
      lat: decryptedLat,
      lng: decryptedLng,
    },
    posts,
    flashes,
  };

  return response;

  // const {
  //   posts,
  //   flashes,
  //   senderTalkRooms,
  //   recipientTalkRooms,
  //   talkRoomMessages,
  //   readTalkRoomMessages,
  //   viewedFlashes,
  //   ...rest
  // } = data!;

  // const result = createClientData({
  //   user: rest,
  //   posts,
  //   flashes,
  //   readTalkRoomMessages,
  //   viewedFlashes,
  //   senderTalkRooms,
  //   recipientTalkRooms,
  // });

  // return {
  //   ...result,
  //   sub: _data,
  // };
};

export const logout = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;

  await prisma.deviceToken.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      login: false,
    },
  });

  return h.response().code(200);
};

const sampleLogin = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const data = await prisma.user.findUnique({
    where: { id: "46a4db78-c5c5-4d85-b11d-a32e93f025f1" },
    include: createClientIncludes,
  });

  await prisma.user.update({
    where: {
      id: "46a4db78-c5c5-4d85-b11d-a32e93f025f1",
    },
    data: {
      login: true,
    },
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

  const clientData = createClientData({
    user: rest,
    posts,
    flashes,
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
  logout,
  sampleLogin,
};
