import Joi from "joi";

import { throwInvalidError, throwLoginError } from "~/helpers/errors";

export type CreatePrivateZonePayload = {
  address: string;
  lat: number;
  lng: number;
};

const createValidation = {
  payload: Joi.object<CreatePrivateZonePayload>({
    address: Joi.string().required(),
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }),
};

const createFailAction = () => throwLoginError();

export const privateZoneValidator = {
  create: {
    validator: createValidation,
    failAction: createFailAction,
  },
};
