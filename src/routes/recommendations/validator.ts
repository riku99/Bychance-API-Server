import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreateRecommendatoinPayload = {
  title: string;
  text: string;
  coupon: boolean;
  endTime?: Date;
  images: string; // 配列stringfyしたものがくる
};

const createValidation = {
  payload: Joi.object<CreateRecommendatoinPayload>({
    title: Joi.string().required(),
    text: Joi.string().optional(),
    coupon: Joi.boolean().required(),
    endTime: Joi.date().optional(),
    images: Joi.array().required(),
  }),
};

const createFailAction = () => throwInvalidError();

export const recommendationValidator = {
  create: {
    validator: createValidation,
    failAction: createFailAction,
  },
};
