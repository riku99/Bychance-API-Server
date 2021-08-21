import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type GetNearbyUsersQuery = {
  range: number;
  id: string;
};
const getValidation = {
  query: Joi.object<GetNearbyUsersQuery>({
    // lat: Joi.number().required(), セキュリティ的にクエリで指定しない。DBからとる
    // lng: Joi.number().required(),
    range: Joi.number().required(),
    id: Joi.string().required(), // クエリには認証用idが毎回含まれるので、クエリをバリデーションの対象にする場合はidも許可する
  }),
};
const getFailAction = () => throwInvalidError();

export const validators = {
  get: {
    validator: getValidation,
    failAction: getFailAction,
  },
};
