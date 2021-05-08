import Joi from "joi";
import { User } from "@prisma/client";

import { throwInvalidError } from "~/helpers/errors";

export type UpdateUserPayload = {
  name: string;
  avatar?: string;
  introduce: string;
  statusMessage: string;
  deleteAvatar: boolean;
  backGroundItem?: string;
  backGroundItemType?: "image" | "video";
  deleteBackGroundItem: boolean;
  backGroundItemExt?: string;
};

const update = {
  payload: Joi.object<UpdateUserPayload>({
    name: Joi.string().required(),
    avatar: Joi.string().optional(),
    introduce: Joi.string().allow("").required(),
    statusMessage: Joi.string().allow("").required(),
    deleteAvatar: Joi.boolean().required(),
    backGroundItem: Joi.string().optional(),
    backGroundItemType: Joi.string().valid("image", "video").optional(),
    deleteBackGroundItem: Joi.boolean().required(),
    backGroundItemExt: Joi.string().optional(),
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

export type ChangeUserDisplayPayload = {
  display: boolean;
};

const displayValidation = {
  payload: Joi.object<ChangeUserDisplayPayload>({
    display: Joi.boolean().required(),
  }),
};

const changeUserDisplayFailAction = () => {
  return throwInvalidError();
};

export const changeUserDisplayValidator = {
  validator: displayValidation,
  failAction: changeUserDisplayFailAction,
};
