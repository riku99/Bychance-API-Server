import Joi from "joi";
import Boom from "@hapi/boom";

import { throwInvalidError } from "~/helpers/errors";

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
  return throwInvalidError("無効なデータが含まれています");
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
  return throwInvalidError();
};

export const refreshUserValidator = {
  validate: refresh,
  failAction: refreshFailAction,
};

export type UpdateLocationPayload = {
  lat: number;
  lng: number;
};

const location = {
  payload: Joi.object<UpdateLocationPayload>({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }),
};

const locationFailAction = () => {
  return throwInvalidError();
};

export const updateLocationValidator = {
  validate: location,
  failAction: locationFailAction,
};
