import Joi from "joi";
import { FlashStamp } from "@prisma/client";

import { throwInvalidError } from "~/helpers/errors";

export type CreateFlashStampPayload = {
  flashId: number;
  value: FlashStamp["value"];
};

const createValidation = {
  payload: Joi.object<CreateFlashStampPayload>({
    flashId: Joi.number().required(),
    value: Joi.string()
      .valid("thumbsUp", "yusyo", "yoi", "itibann", "seikai")
      .required(),
  }),
};

const createFaliAction = () => throwInvalidError();

export const createFlashStampValidator = {
  validate: createValidation,
  failAction: createFaliAction,
};
