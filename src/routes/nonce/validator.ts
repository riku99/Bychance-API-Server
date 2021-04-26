import Joi from "joi";

export type NoncePayload = { nonce: string };

const create = Joi.object<{ nonce: string }>({
  nonce: Joi.string().required(),
});

export const nonceValidator = {
  create,
};
