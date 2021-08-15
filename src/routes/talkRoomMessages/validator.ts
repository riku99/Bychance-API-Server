import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreateTalkRoomMessagePayload = {
  partnerId: string;
  text: string;
};
export type CreateParams = {
  talkRoomId: string;
};
const createValidation = {
  payload: Joi.object<CreateTalkRoomMessagePayload>({
    text: Joi.string().required(),
    partnerId: Joi.string().required(),
  }),
  params: Joi.object<CreateParams>({
    talkRoomId: Joi.string().required(),
  }),
};
const createFailAction = () => throwInvalidError();

export type GetsParams = {
  talkRoomId: number;
};
const getValidation = {
  params: Joi.object<GetsParams>({
    talkRoomId: Joi.string().required(),
  }),
};
const getsFailAction = () => throwInvalidError();

export const validators = {
  gets: {
    validator: getValidation,
    failAction: getsFailAction,
  },
  create: {
    validator: createValidation,
    failAction: createFailAction,
  },
};
