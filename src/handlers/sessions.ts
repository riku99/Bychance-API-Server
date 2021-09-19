import Hapi from "@hapi/hapi";
import axios, { AxiosResponse } from "axios";
import { PrismaClient, UnwrapPromise } from "@prisma/client";

import {
  createHash,
  createRandomString,
  handleUserLocationCrypt,
} from "~/helpers/crypto";
import { LineLoginHeaders } from "~/routes/sessions/validator";
import { throwLoginError } from "~/helpers/errors";
import { Artifacts } from "~/auth/bearer";
import { getLoginData } from "~/db/query/sessions";

const prisma = new PrismaClient();

const formLoginData = (
  data: UnwrapPromise<NonNullable<ReturnType<typeof getLoginData>>>
) => {
  if (!data) {
    return;
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

  return {
    user: {
      ...restUserData,
      lat: decryptedLat,
      lng: decryptedLng,
    },
    posts,
    flashes,
  };
};

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
  const accessToken = createRandomString(); // ユーザー側で保存
  const hashededAccessToken = createHash(accessToken); // DBに保存
  const name = res!.data.name;
  const avatar = res!.data.picture ? (res!.data.picture as string) : null;

  const existingUser = await prisma.user.findUnique({
    where: { lineId: hashedLineId },
    select: {
      id: true,
    },
  });

  let loginData;

  if (existingUser) {
    // 既に存在していた場合はアクセストークンと、(おそらくログアウト状態だったので)loginを更新
    await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        accessToken: hashededAccessToken,
        login: true,
      },
    });

    loginData = await getLoginData(existingUser.id);
  } else {
    const newUser = await prisma.user.create({
      data: {
        lineId: hashedLineId,
        accessToken: hashededAccessToken,
        name,
        avatar,
      },
    });

    loginData = await getLoginData(newUser.id);
  }

  return {
    ...formLoginData(loginData),
    accessToken,
  };
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

  const data = await getLoginData(user.id);

  if (!data) {
    return throwLoginError();
  }

  return formLoginData(data);
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
  const sampleUser = await prisma.user.findUnique({
    where: { id: "sampleuserid" },
    select: {
      id: true,
    },
  });

  if (!sampleUser) {
    return throwLoginError();
  }

  await prisma.user.update({
    where: {
      id: "sampleuserid",
    },
    data: {
      login: true,
    },
  });

  const data = await getLoginData(sampleUser.id);

  return {
    ...formLoginData(data),
    accessToken: "denzi",
  };
};

export const sessionsHandler = {
  lineLogin,
  sessionLogin,
  logout,
  sampleLogin,
};
