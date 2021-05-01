import Joi from "joi";
import { User } from "@prisma/client";
import Boom from "@hapi/boom";

import { invalidErrorType } from "~/config/apis/errors";

export type UpdateUserPayload = {
  name: string;
  avatar?: string;
  introduce: string;
  statusMessage: string;
  deleteImage: boolean;
};

const update = {
  payload: Joi.object<UpdateUserPayload>({
    name: Joi.string().required(),
    avatar: Joi.string().optional(),
    introduce: Joi.string().allow("").required(),
    statusMessage: Joi.string().allow("").required(),
    deleteImage: Joi.boolean().required(),
  }),
};

const updateFailAction = () => {
  const error = Boom.badRequest();
  error.output.payload.message = "無効なデータが含まれています";
  error.output.payload.errorType = invalidErrorType;
  throw error;
};

export const updateUserValidator = {
  validate: update,
  failAction: updateFailAction,
};

export type RefreshUserPayload = {
  userId: string;
};

const refresh = {
  payload: Joi.object<RefreshUserPayload>({
    userId: Joi.string().required(),
  }),
};

const refreshFailAction = () => {
  const error = Boom.badRequest();
  error.output.payload.message = "無効なリクエストです";
  error.output.payload.errorType = invalidErrorType;
  throw error;
};

export const refreshUserValidator = {
  validate: refresh,
  failAction: refreshFailAction,
};
