import Joi from "joi";

import { failAction } from "~/helpers/valiadtions/failAction";

export type CreateUserAuthCode = {
  code: string;
};
const validationForCreateUserAuthCode = {
  payload: {
    code: Joi.string().required(),
  },
};

export const validators = {
  create: {
    validator: validationForCreateUserAuthCode,
    failAction,
  },
};
