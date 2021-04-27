import Hapi from "@hapi/hapi";
import axios from "axios";

import { SessionsReqestType } from "~/routes/sessions/validator";

const line = {
  create: async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const headers = req.headers as SessionsReqestType["line"]["create"]["headers"];
    const token = headers.authorization.split(" ")[1]; // Bearer取り出し
    const body = `id_token=${token}&client_id=${process.env.ChannelId}`; // x-www-form-urlencodedに形成

    try {
      const res = await axios.post(
        "https://api.line.me/oauth2/v2.1/verify",
        body,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      console.log(res.data);
    } catch (e) {
      console.log(e);
    }

    return h.response().code(200); // payload返さない場合でもcode指定しないとエラーコード返る
  },
};

export const sessionsHandler = {
  line,
};
