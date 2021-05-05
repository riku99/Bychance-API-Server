import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type GetnearbyUsersQuery = {
  lat: number;
  lng: number;
  range: number;
  id: string;
};

const getValidation = {
  query: Joi.object<GetnearbyUsersQuery>({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
    range: Joi.number().required(),
    id: Joi.string().required(), // クエリには認証用idが毎回含まれるので、クエリをバリデーションの対象にする場合はidも許可する
  }),
};

const getFailAction = () => throwInvalidError();

export const getNearbyUsersValidator = {
  validate: getValidation,
  failAction: getFailAction,
};
