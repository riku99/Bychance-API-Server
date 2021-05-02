import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreateViewedFlashPayload = {
  flashId: number;
};

const createValidation = {
  payload: Joi.object<CreateViewedFlashPayload>({
    flashId: Joi.number().required(),
  }),
};

const createFaliAction = () => throwInvalidError();

export const createViewedFlashValidator = {
  validate: createValidation,
  failAction: createFaliAction,
};
