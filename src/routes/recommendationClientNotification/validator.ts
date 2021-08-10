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

export const validators = {
  get: {
    validator: getValidation,
    failAction: getFailAction,
  },
};
