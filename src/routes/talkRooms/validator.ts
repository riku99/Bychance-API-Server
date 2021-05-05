import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreateTalkRoomPayload = {
  partnerId: string;
};

const createValodation = {
  payload: Joi.object<CreateTalkRoomPayload>({
    partnerId: Joi.string().required(),
  }),
};

const createFailAction = () => throwInvalidError();

export const createTalkRoomValidator = {
  validate: createValodation,
  failAction: createFailAction,
};
