import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

export type CreatePostPayload = {
  text: string;
  image: string;
};

const createValidation = {
  payload: Joi.object<CreatePostPayload>({
    text: Joi.string().allow("").required(),
    image: Joi.string().allow("").required(),
  }),
};

const createFailAction = () => {
  return throwInvalidError();
};

export const createPostValidator = {
  validate: createValidation,
  failAction: createFailAction,
};
