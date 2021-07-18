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
    title: Joi.string().required(),
    text: Joi.string().allow("").optional(),
    coupon: Joi.boolean().required(),
    endTime: Joi.date().optional(),
    images: Joi.array().required(),
  }),
};

const createFailAction = () => throwInvalidError();

export type GetRecommendationsForClientQuery = {
  type?: string;
};

const getRecommendationsForClientValidation = {
  query: Joi.object<GetRecommendationsForClientQuery>({
    type: Joi.string().allow("now").optional(),
  }),
};

const getRecommendationsForClientFailAciton = () => throwInvalidError();

export const recommendationValidator = {
  create: {
    validator: createValidation,
    failAction: createFailAction,
  },
  getForClient: {
    validator: getRecommendationsForClientValidation,
    failAction: getRecommendationsForClientFailAciton,
  },
};
