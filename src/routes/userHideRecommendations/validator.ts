import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreateUserHideRecommendationParams = {
  id: string;
};

const createValidation = {
  params: Joi.object<CreateUserHideRecommendationParams>({
    id: Joi.string().required(),
  }),
};

const createFailAction = () => throwInvalidError();

export const validators = {
  create: {
    validator: createValidation,
    failAction: createFailAction,
  },
};
