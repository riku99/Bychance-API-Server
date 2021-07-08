import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type GetClientSignupTokenParams = {
  signupToken: string;
};

const getValidation = {
  params: Joi.object<GetClientSignupTokenParams>({
    signupToken: Joi.string().required(),
  }),
};

const getFAilAction = () => throwInvalidError();

export const clientSignupTokenValidator = {
  get: {
    validator: getValidation,
    failAction: getFAilAction,
  },
};
