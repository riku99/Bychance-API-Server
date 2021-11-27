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

export const validators = {
  delete: {
    validator: deleteValidation,
    failAction: deleteFailAction,
  },
  create: {
    validator: createValidation,
    failAction: createFailAction,
  },
};
