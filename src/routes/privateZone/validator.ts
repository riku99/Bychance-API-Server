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

export type DeletePrivateZoneParams = {
  id: string;
};

const deleteValidation = {
  params: Joi.object<DeletePrivateZoneParams>({
    id: Joi.string().required(),
  }),
};

const deleteFailAction = () => throwInvalidError();

export const privateZoneValidator = {
  create: {
    validator: createValidation,
    failAction: createFailAction,
  },
  delete: {
    validator: deleteValidation,
    failAction: deleteFailAction,
  },
};
