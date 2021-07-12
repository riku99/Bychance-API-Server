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

export type UpdateRecommendationClientPaylaod = {
  name: string;
  image?: string;
  address?: string;
  url?: string;
  instagram?: string;
  twitter?: string;
  ext?: string;
};

const updateValidation = {
  payload: Joi.object<UpdateRecommendationClientPaylaod>({
    name: Joi.string().required(),
    image: Joi.string().optional(),
    ext: Joi.string().optional(),
    address: Joi.string().optional(),
    url: Joi.string().optional(),
    instagram: Joi.string().optional(),
    twitter: Joi.string().optional(),
  }),
};

const updateFailAction = () => throwInvalidError();

export const recommendationClientValidator = {
  create: {
    validator: createValidation,
    failAction: createFailAction,
  },
  update: {
    validator: updateValidation,
    failAction: updateFailAction,
  },
};
