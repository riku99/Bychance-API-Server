import Joi from "joi";

import { failAction } from "~/helpers/valiadtions/failAction";

export type CreateUserAuthCode = {
  email: string;
};
const validationForCreateUserAuthCode = {
  payload: Joi.object<CreateUserAuthCode>({
    email: Joi.string().required(),
  }),
};

export const validators = {
  create: {
    validator: validationForCreateUserAuthCode,
    failAction,
  },
};
