import Joi from "joi";

export type SessionsReqestType = {
  line: {
    create: {
      headers: { authorization: string };
    };
  };
};

const line = {
  create: {
    headers: Joi.object<SessionsReqestType["line"]["create"]["headers"]>({
      authorization: Joi.string().required(),
    }),
  },
};

// const emailAndPass = () => {}; セッションを構築する方法は複数になることが考えられるので分ける

export const sessionsValidator = {
  line,
};
