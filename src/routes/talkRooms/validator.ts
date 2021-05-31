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

export const createTalkRoomValidator = {
  validate: createValidation,
  failAction: createFailAction,
};

export type DeleteTalkRoomParams = {
  talkRoomId: number;
};

const deleteValidation = {
  params: Joi.object<DeleteTalkRoomParams>({
    talkRoomId: Joi.number().required(),
  }),
};

const deleteFailAction = () => throwInvalidError();

export const deleteTalkRoomValidator = {
  validate: deleteValidation,
  failAction: deleteFailAction,
};
