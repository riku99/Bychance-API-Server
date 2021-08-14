import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreateTalkRoomPayload = {
  partnerId: string;
};
const createValidation = {
  payload: Joi.object<CreateTalkRoomPayload>({
    partnerId: Joi.string().required(),
  }),
};
const createFailAction = () => throwInvalidError();

export type DeleteTalkRoomParams = {
  talkRoomId: number;
};
const deleteValidation = {
  params: Joi.object<DeleteTalkRoomParams>({
    talkRoomId: Joi.number().required(),
  }),
};
const deleteFailAction = () => throwInvalidError();

export type GetParams = {
  userId: string;
};
const getValidation = {
  params: Joi.object<GetParams>({
    userId: Joi.string().required(),
  }),
};
const getFailAction = () => throwInvalidError();

export const validators = {
  get: {
    validator: getValidation,
    failAction: getFailAction,
  },
  delete: {
    validator: deleteValidation,
    failAction: deleteFailAction,
  },
  create: {
    validator: createValidation,
    failAction: createFailAction,
  },
};
