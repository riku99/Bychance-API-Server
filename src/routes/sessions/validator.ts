import Joi from "joi";
import Hapi from "@hapi/hapi";

import { createErrorBody } from "~/helpers/errors";

export type SessionsReqestType = {
  line: {
    create: {
      headers: { authorization: string };
    };
  };
};

const lineLoginValidator = {
  headers: Joi.object<SessionsReqestType["line"]["create"]["headers"]>({
    authorization: Joi.string().required(),
  }),
};

const lineLoginFailAction = (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit,
  err: Error | undefined
) => {
  return h
    .response(createErrorBody({ name: "loginError" }))
    .code(400)
    .takeover(); // takeoverでデフォルトの値書き換え
};

// const emailAndPass = () => {}; セッションを構築する方法は複数になることが考えられるので分ける

export const sessionsValidator = {
  lineLogin: {
    validate: lineLoginValidator,
    failAction: lineLoginFailAction,
  },
};
