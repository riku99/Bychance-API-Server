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

export const createTalkRoomMessageValidator = {
  validate: createValidation,
  failAction: createFailAction,
};
