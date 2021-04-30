import Hapi from "@hapi/hapi";
import axios, { AxiosResponse } from "axios";
import { PrismaClient } from "@prisma/client";

import { createHash, createRandomString } from "~/helpers/crypto";
import { LineLoginHeaders } from "~/routes/sessions/validator";
import { serializeUser } from "~/serializers/users";
import { throwLoginError } from "~/helpers/errors";
import { createClientData } from "~/helpers/clientData";

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

  if (existingUser) {
    // userが存在する場合はそれを返す
    const user = await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        accessToken: hashededAccessToken,
      },
      include: {
        posts: true,
        flashes: true,
        senderTalkRooms: true,
        recipientTalkRooms: true,
        talkRoomMessages: true,
        readTalkRoomMessages: true,
      },
    });

    const {
      posts,
      flashes,
      senderTalkRooms,
      recipientTalkRooms,
      talkRoomMessages,
      readTalkRoomMessages,
      ...rest
    } = user;

    const allTalkRooms = [...senderTalkRooms, ...recipientTalkRooms];

    const r = createClientData({
      user: rest,
      posts,
      flashes,
      talkRooms: allTalkRooms,
      talkRoomMessages,
      readTalkRoomMessages,
    });

    console.log("シリアライズ");
    console.log(r);

    return r;
  } else {
    // userが存在しない場合は登録
    const name = res!.data.name;
    const avatar = res!.data.picture ? (res!.data.picture as string) : null;

    const newUser = await prisma.user.create({
      data: {
        lineId: hashedLineId,
        accessToken: hashededAccessToken,
        name,
        avatar,
      },
    });

    return serializeUser({ user: newUser });
  }
};

export const sessionLogin = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts;

  console.log(user);
  return user;
};

export const sessionsHandler = {
  lineLogin,
  sessionLogin,
};
