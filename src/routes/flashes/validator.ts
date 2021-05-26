import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreateFlashPayload = {
  source: string;
  sourceType: "image" | "video";
  ext: string;
};

const createValidation = {
  payload: Joi.object<CreateFlashPayload>({
    source: Joi.string().required(),
    sourceType: Joi.string().valid("image", "video").required(),
    ext: Joi.string().required(),
  }),
};

const createFailAction = () => throwInvalidError();

export const createFlashValidator = {
  validate: createValidation,
  failAction: createFailAction,
};

export type DeleteFlashParams = {
  flashId: string;
};

const deleteValidation = {
  params: Joi.object<DeleteFlashParams>({
    flashId: Joi.string().required(),
  }),
};

const deleteFailAciton = () => throwInvalidError();

export const deleteFlashValidator = {
  validate: deleteValidation,
  failAction: deleteFailAciton,
};
