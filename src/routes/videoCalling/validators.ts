import Joi from "joi";
import { throwInvalidError } from "~/helpers/errors";

const failAction = () => throwInvalidError();

export type CreateRTCTToken = {
  channelName: string;
  otherUserId: string;
};
const createValidation = {
  paylaod: Joi.object<CreateRTCTToken>({
    channelName: Joi.string().required(),
    otherUserId: Joi.string().required(),
  }),
};

export const validators = {
  create: {
    validator: createValidation,
    failAction,
  },
};
