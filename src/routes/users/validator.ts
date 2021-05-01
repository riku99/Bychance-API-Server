import Joi from "joi";
import { User } from "@prisma/client";
import Boom from "@hapi/boom";

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
  throw error;
};

export const updateUserValidator = {
  validate: update,
  failAction: updateFailAction,
};
