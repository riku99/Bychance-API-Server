import Hapi from "@hapi/hapi";
import axios, { AxiosResponse } from "axios";
import { PrismaClient } from "@prisma/client";

import { createHash, createRandomString } from "~/helpers/crypto";
import { LineLoginHeaders } from "~/routes/sessions/validator";
import { createErrorBody } from "~/helpers/errors";
import { serializeUser } from "~/serializers/users";

const prisma = new PrismaClient();

const lineLogin = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  try {
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
      return h.response(createErrorBody({ name: "loginError" })).code(400);
    }

    const nonce = res!.data.nonce as string;
    const existingNonce = await prisma.nonce.findUnique({
      where: { nonce },
    });

    if (!existingNonce) {
      return h.response(createErrorBody({ name: "loginError" })).code(400);
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
      });

      return serializeUser({ user });
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
  } catch (e) {
    console.log(e);
    return h.response().code(500);
  }
};

export const sessionLogin = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  try {
    const user = req.auth.artifacts;

    console.log(user);
    return user;
  } catch (err) {
    console.log(err);
    return h.response().code(500);
  }
};

export const sessionsHandler = {
  lineLogin,
  sessionLogin,
};
