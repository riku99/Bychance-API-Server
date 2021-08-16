import Joi from "joi";
import { Post } from "@prisma/client";

import { throwInvalidError } from "~/helpers/errors";
import { GetParams } from "../talkRooms/validator";

export type CreatePostPayload = {
  text: string;
  source: string;
  sourceType: Post["sourceType"];
  ext: string;
};
const createValidation = {
  payload: Joi.object<CreatePostPayload>({
    text: Joi.string().allow("").max(150).required(),
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
export type DeletePostParams = {
  postId: number;
};
const deletePostValidation = {
  params: Joi.object<DeletePostParams>({
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

export type GetUserPostsParams = {
  userId: string;
};
const getValidation = {
  params: Joi.object<GetUserPostsParams>({
    userId: Joi.string().required(),
  }),
};
const getFailAction = () => throwInvalidError();

export const validators = {
  gets: {
    validator: getValidation,
    failAction: getFailAction,
  },
};
