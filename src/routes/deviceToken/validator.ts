import Joi from "joi";
import { throwInvalidError } from "~/helpers/errors";

export type CreateDeviceTokenPayload = {
  token: string;
};

const createValidation = {
  payload: Joi.object<CreateDeviceTokenPayload>({
    token: Joi.string().required(),
  }),
};

const createFailAction = () => throwInvalidError();

export const createDeviceTokenValidator = {
  validate: createValidation,
  failAction: createFailAction,
};
