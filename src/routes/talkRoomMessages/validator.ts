import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreateTalkRoomMessagePayload = {
  talkRoomId: number;
  partnerId: string;
  text: string;
};
const createValidation = {
  payload: Joi.object<CreateTalkRoomMessagePayload>({
    talkRoomId: Joi.number().required(),
    text: Joi.string().required(),
    partnerId: Joi.string().required(),
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
