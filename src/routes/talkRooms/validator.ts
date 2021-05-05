import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreateTalkRoomPayload = {
  partnerId: number;
};

const createValodation = {
  payload: Joi.object<CreateTalkRoomPayload>({
    partnerId: Joi.number().required(),
  }),
};

const createFailAction = () => throwInvalidError();

export const createTalkRoomValidator = {
  validate: createValodation,
  failAction: createFailAction,
};
