import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreateUserHideRecommendationPayload = {
  id: number;
};

const createValidation = {
  payload: Joi.object<CreateUserHideRecommendationPayload>({
    id: Joi.number().required(),
  }),
};

const createFailAction = () => throwInvalidError();

export const validators = {
  create: {
    validator: createValidation,
    failAction: createFailAction,
  },
};
