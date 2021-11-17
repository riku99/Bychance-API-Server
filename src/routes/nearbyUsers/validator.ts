import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type GetNearbyUsersQuery = {
  range: number;
};
const getValidation = {
  query: Joi.object<GetNearbyUsersQuery>({
    range: Joi.number().required(),
  }),
};
const getFailAction = () => throwInvalidError();

export const validators = {
  get: {
    validator: getValidation,
    failAction: getFailAction,
  },
};
