import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

const failAction = () => throwInvalidError();

export type CreateRecommendationClientPayload = {
  // name: string;
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

export type UpdateRecommendationClientPaylaod = {
  name: string;
  image?: string;
  address?: string;
  url?: string;
  instagram?: string;
  twitter?: string;
  ext?: string;
  lat?: number;
  lng?: number;
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
    lat: Joi.number().optional(),
    lng: Joi.number().optional(),
  }),
};

export type VerifyEmailPayload = {
  code: number;
};
const verifyEmailValidation = {
  payload: Joi.object<VerifyEmailPayload>({
    code: Joi.number().required(),
  }),
};

export const validators = {
  create: {
    validator: createValidation,
    failAction,
  },
  update: {
    validator: updateValidation,
    failAction,
  },
  verifyEmail: {
    validator: verifyEmailValidation,
    failAction,
  },
};
