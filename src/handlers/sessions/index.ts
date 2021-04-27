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
        // payloadにログインエラーであることを表すために値持たせる
        return h.response().code(401);
      }

      const lineId = res.data.sub as string;
      const hashedLineId = createHash(lineId);

      // lineIdはハッシュ 化して保存するため、同じプロセスでハッシュ化して検証するようにする
      const existingUser = await User.findFirstByLineId({
        lineId: hashedLineId,
      });

      const accessToken = createRandomString(); // ユーザー側で保存
      const hashededAccessToken = createHash(accessToken); // DBに保存

      if (existingUser) {
        // userが存在する場合はそれを返す
        const result = await prisma.user.update({
          where: {
            id: existingUser.id,
          },
          data: {
            accessToken: hashededAccessToken,
          },
        });

        console.log(result);
      } else {
        // userが存在しない場合は登録
        const name = res.data.name;
        const avatar = res.data.picture ? (res.data.picture as string) : null;

        const newUser = await User.create({
          lineId: hashedLineId,
          accessToken: hashededAccessToken,
          name,
          avatar,
        });

        console.log(newUser);
        return h.response(newUser).code(200);
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
