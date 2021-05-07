import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreateDeleteTalkRoomPayload = {
  talkRoomId: number;
};

const createValidation = {
  payload: Joi.object<CreateDeleteTalkRoomPayload>({
    talkRoomId: Joi.number().required(),
  }),
};

const createFailAction = () => throwInvalidError();

export const createDeleteTalkRoomValidator = {
  validate: createValidation,
  failAction: createFailAction,
};
