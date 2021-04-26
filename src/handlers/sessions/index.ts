import Hapi from "@hapi/hapi";
import axios from "axios";

import { SessionsReqestType } from "~/routes/sessions/validator";

const line = {
  create: async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const headers = req.headers as SessionsReqestType["line"]["create"]["headers"];

    const token = headers.authorization.split(" ");

    console.log(token[1]);
    console.log(headers);
    return h.response().code(200); // payload返さない場合でもcode指定しないとエラーコード返る
  },
};

export const sessionsHandler = {
  line,
};
