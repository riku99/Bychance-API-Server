import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreatePrivateTimePayload = {
  startHours: number;
  startMinutes: number;
  endHours: number;
  endMinutes: number;
};

const createValidation = {
  payload: Joi.object<CreatePrivateTimePayload>({
    startHours: Joi.number().required(),
    startMinutes: Joi.number().required(),
    endHours: Joi.number().required(),
    endMinutes: Joi.number().required(),
  }),
};

const createFailAction = () => throwInvalidError();

export const privateTimeValidator = {
  create: {
    validator: createValidation,
    failAction: createFailAction,
  },
};
