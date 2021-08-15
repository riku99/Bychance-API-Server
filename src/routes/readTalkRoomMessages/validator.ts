import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreatePayload = {
  ids: number[];
};
export type CreateParams = {
  talkRoomId: string;
};
const _createValidation = {
  payload: Joi.object<CreatePayload>({
    ids: Joi.array().items(Joi.number()).required(),
  }),
  params: Joi.object<CreateParams>({
    talkRoomId: Joi.string().required(),
  }),
};
const _createFailAction = () => throwInvalidError();

export const validators = {
  create: {
    validator: _createValidation,
    failAction: _createFailAction,
  },
};
