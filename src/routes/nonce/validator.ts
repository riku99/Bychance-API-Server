import Joi from "joi";
import { throwLoginError } from "~/helpers/errors";

export type NoncePayload = { nonce: string };

const create = Joi.object<{ nonce: string }>({
  nonce: Joi.string().required(),
});

// バリデーションエラーなので400を返すのが一般的だが、再度ログインプロセスを踏ませたいので401でloginError返す
const createFailAction = () => {
  return throwLoginError();
};

export const createNonceValidator = {
  validate: create,
  failAction: createFailAction,
};
