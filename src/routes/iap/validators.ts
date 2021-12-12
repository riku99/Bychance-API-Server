import Joi from "joi";

export type VerifyIAPPayload = {
  platform: "ios" | "android";
  productId: string;
  receipt?: string;
};
const postValidator = {
  payload: Joi.object<VerifyIAPPayload>({
    platform: Joi.string().valid("ios", "android").required(),
    productId: Joi.string().required(),
    receipt: Joi.string().optional(),
  }),
};

export const validators = {
  post: {
    validator: postValidator,
  },
};
