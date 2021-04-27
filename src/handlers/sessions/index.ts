import Hapi from "@hapi/hapi";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

import { Nonce } from "~/models/nonce";
import { User } from "~/models/users";
import { createHash, createRandomString } from "~/helpers/crypto";

import { SessionsReqestType } from "~/routes/sessions/validator";

const prisma = new PrismaClient();

const line = {
  create: async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
    try {
      const headers = req.headers as SessionsReqestType["line"]["create"]["headers"];
      const token = headers.authorization.split(" ")[1]; // Bearer取り出し
      const body = `id_token=${token}&client_id=${process.env.ChannelId}`; // x-www-form-urlencodedに形成

      const res = await axios.post(
        "https://api.line.me/oauth2/v2.1/verify",
        body,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const nonce = res.data.nonce as string;
      const existingNonce = await Nonce.findFirst({ nonce });

      if (!existingNonce) {
        return h.response().code(401); // あとでpayloadにログインエラーであることを表すために値持たせる
      }

      const lineId = res.data.sub as string;
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

        console.log(user);
        return user;
      } else {
        // userが存在しない場合は登録
        const name = res.data.name;
        const avatar = res.data.picture ? (res.data.picture as string) : null;

        const newUser = await prisma.user.create({
          data: {
            lineId: hashedLineId,
            accessToken: hashededAccessToken,
            name,
            avatar,
          },
        });

        console.log(newUser);
        return newUser;
      }

      return h.response().code(200); // payload返さない場合でもcode指定しないとエラーコード返る
    } catch (e) {
      console.log(e);
      return h.response().code(500);
    }
  },
};

export const sessionsHandler = {
  line,
};
