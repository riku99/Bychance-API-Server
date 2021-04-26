import Joi from "joi";

const create = Joi.object({
  nonce: Joi.string().required(),
});

export const joiValidator = {
  create,
};
