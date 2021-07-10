import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreateRecommendationClientPayload = {
  name: string;
};

export type CreateRecommendationClientHeaders = { authorization: string };

const createValidation = {
  payload: Joi.object<CreateRecommendationClientPayload>({
    name: Joi.string().max(30).required(),
  }),
  header: Joi.object<CreateRecommendationClientHeaders>({
    authorization: Joi.string().required(),
  }),
};

const createFailAction = () => throwInvalidError();

export const recommendationClientValidator = {
  create: {
    validator: createValidation,
    failAction: createFailAction,
  },
};
