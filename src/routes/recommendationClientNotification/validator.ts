import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type GetParams = {
  id: string;
};
const getValidation = {
  params: Joi.object<GetParams>({
    id: Joi.string().required(),
  }),
};
const getFailAction = () => throwInvalidError();

export type CreatePayload = {
  title: string;
  text: string;
};
const createValidation = {
  payload: Joi.object<CreatePayload>({
    title: Joi.string().required(),
    text: Joi.string().required(),
  }),
};
const createFailAction = () => throwInvalidError();

export const validators = {
  get: {
    validator: getValidation,
    failAction: getFailAction,
  },
  create: {
    validator: createValidation,
    failAction: createFailAction,
  },
};
