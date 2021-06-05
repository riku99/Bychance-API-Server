import Joi from "joi";
import { Post } from "@prisma/client";

import { throwInvalidError } from "~/helpers/errors";

export type CreatePostPayload = {
  text: string;
  source: string;
  sourceType: Post["sourceType"];
  ext: string;
};

const createValidation = {
  payload: Joi.object<CreatePostPayload>({
    text: Joi.string().allow("").required(),
    source: Joi.string().required(),
    sourceType: Joi.string().valid("image", "video").required(),
    ext: Joi.string().required(),
  }),
};

const createFailAction = () => {
  return throwInvalidError();
};

export const createPostValidator = {
  validate: createValidation,
  failAction: createFailAction,
};

export type DeletePostPayload = {
  postId: number;
};

const deletePostValidation = {
  payload: Joi.object<DeletePostPayload>({
    postId: Joi.number().required(),
  }),
};

const deleteFailAction = () => {
  return throwInvalidError();
};

export const deletePostValidator = {
  validate: deletePostValidation,
  failAction: deleteFailAction,
};
