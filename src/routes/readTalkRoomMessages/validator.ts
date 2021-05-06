import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreateReadTalkRoomMessaagePayload = {
  talkRoomId: number;
  partnerId: string;
  unreadNumber: number;
};

const createValidation = {
  payload: Joi.object<CreateReadTalkRoomMessaagePayload>({
    talkRoomId: Joi.number().required(),
    partnerId: Joi.string().required(),
    unreadNumber: Joi.number().required(),
  }),
};

const createFailAction = () => throwInvalidError();

export const createReadTalkRoomMessagesValidator = {
  validate: createValidation,
  failAction: createFailAction,
};
