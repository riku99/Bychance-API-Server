import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreateRecommendatoinPayload = {
  title: string;
  text: string;
  coupon: boolean;
  endTime?: Date;
  images: {
    src: string;
    ext: string;
  }[];
};

const createValidation = {
  payload: Joi.object<CreateRecommendatoinPayload>({
    title: Joi.string().max(35).required(),
    text: Joi.string().allow("").optional(),
    coupon: Joi.boolean().required(),
    endTime: Joi.date().optional(),
    images: Joi.array().required(),
  }),
};

const createFailAction = () => throwInvalidError();

export type GetRecommendationsForClientQuery = {
  type?: "now";
};

const getRecommendationsForClientValidation = {
  query: Joi.object<GetRecommendationsForClientQuery>({
    type: Joi.string().allow("now").optional(),
  }),
};

const getRecommendationsForClientFailAciton = () => throwInvalidError();

export type HideRecommendationParams = {
  id: string;
};

const hideRecommendationValidation = {
  params: Joi.object<HideRecommendationParams>({
    id: Joi.string().required(),
  }),
};

const hideFailAction = () => throwInvalidError();

export const recommendationValidator = {
  create: {
    validator: createValidation,
    failAction: createFailAction,
  },
  getForClient: {
    validator: getRecommendationsForClientValidation,
    failAction: getRecommendationsForClientFailAciton,
  },
  hide: {
    validator: hideRecommendationValidation,
    failAction: hideFailAction,
  },
};
