import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreatePayload = {
  ids: number[];
};

const createValidation = {
  payload: Joi.object<CreatePayload>({
    ids: Joi.array().items(Joi.number()).required(),
  }),
};
const createFailAction = () => throwInvalidError();

export const validators = {
  create: {
    validation: createValidation,
    failAction: createFailAction,
  },
};
