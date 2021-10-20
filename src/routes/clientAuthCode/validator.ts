import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

const failAction = () => throwInvalidError();

export type VerifyAuthCodeForPasswordResetQuery = {
  code: string;
};
const verifyAuthCodeForPasswordResetValidation = {
  query: Joi.object<VerifyAuthCodeForPasswordResetQuery>({
    code: Joi.string().required(),
  }),
};

export const validators = {
  verifyAuthCodeForPasswordReset: {
    validator: verifyAuthCodeForPasswordResetValidation,
    failAction,
  },
};
