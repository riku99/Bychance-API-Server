import Joi from "joi";
import Hapi from "@hapi/hapi";

import { throwLoginError } from "~/helpers/errors";

export type LineLoginHeaders = { authorization: string };

export const lineLoginValidator = {
  headers: Joi.object<LineLoginHeaders>({
    authorization: Joi.string().required(),
  }),
};

const lineLoginFailAction = (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit,
  err: Error | undefined
) => {
  // ヘッダの有無でバリデーションしていて、バリデーションエラーなら400を返すのが一般的かと思うが、今回は再度ログインプロセスをユーザーに踏ませたいので、ここの場合のバリデーションエラーは401を返す
  return throwLoginError();
};

// const emailAndPass = () => {}; セッションを構築する方法は複数になることが考えられるので分ける

export const sessionsValidator = {
  lineLogin: {
    validate: lineLoginValidator,
    failAction: lineLoginFailAction,
  },
};
