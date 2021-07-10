import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreateRecommendationClientPayload = {
  name: string;
};

const createValidation = {
  payload: Joi.object<CreateRecommendationClientPayload>({
    name: Joi.string().max(30).required(),
  }),
};

const createFailAction = () => throwInvalidError();

export const recommendationClientValidator = {
  create: {
    validator: createValidation,
    failAction: createFailAction,
  },
};
