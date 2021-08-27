import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreatePaylaod = {
  blockTo: string;
};
const createValidation = {
  payload: Joi.object<CreatePaylaod>({
    blockTo: Joi.string().required(),
  }),
};
const createFailAction = () => throwInvalidError();

export const validaotors = {
  create: {
    validaotor: createValidation,
    failAction: createFailAction,
  },
};
