import Joi, { boolean } from "joi";

import { throwInvalidError } from "~/helpers/errors";

const failAction = () => throwInvalidError();

export type UpdateUserPayload = {
  name: string;
  avatar?: string;
  avatarExt?: string | null;
  introduce: string;
  statusMessage: string;
  deleteAvatar: boolean;
  backGroundItem?: string;
  backGroundItemType?: "image" | "video";
  deleteBackGroundItem: boolean;
  backGroundItemExt?: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  tiktok: string | null;
};

const update = {
  payload: Joi.object<UpdateUserPayload>({
    name: Joi.string().required(),
    avatar: Joi.string().optional(),
    avatarExt: Joi.string().allow(null).optional(),
    introduce: Joi.string().allow("").required(),
    statusMessage: Joi.string().allow("").required(),
    deleteAvatar: Joi.boolean().required(),
    backGroundItem: Joi.string().optional(),
    backGroundItemType: Joi.string().valid("image", "video").optional(),
    deleteBackGroundItem: Joi.boolean().required(),
    backGroundItemExt: Joi.string().allow(null).optional(),
    instagram: Joi.string().allow(null),
    twitter: Joi.string().allow(null),
    youtube: Joi.string().allow(null),
    tiktok: Joi.string().allow(null),
  }),
};

const updateFailAction = () => {
  return throwInvalidError("無効なデータが含まれています");
};

export const updateUserValidator = {
  validate: update,
  failAction: updateFailAction,
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

export type GetUserParams = {
  userId: string;
};
const getValidation = {
  params: Joi.object<GetUserParams>({
    userId: Joi.string().required(),
  }),
};
const getFailAction = () => throwInvalidError();

export type ChangeTooltipOfUsersDisplayShowedPayload = {
  value: boolean;
};
const changeTooltipOfUsersDisplayShowedValidation = {
  payload: Joi.object<ChangeTooltipOfUsersDisplayShowedPayload>({
    value: Joi.boolean().required(),
  }),
};
const changeTooltipOfUsersDisplayShowedFailAction = () => throwInvalidError();

export type ChangeGroupsApplicationEnabled = {
  value: boolean;
};
const changeGroupsApplicationEnabledValidation = {
  payload: Joi.object<ChangeGroupsApplicationEnabled>({
    value: Joi.boolean().required(),
  }),
};

export const validators = {
  getUser: {
    validator: getValidation,
    failAction: getFailAction,
  },
  changeTooltipOfUsersDisplayShowed: {
    validator: changeTooltipOfUsersDisplayShowedValidation,
    failAction: changeTooltipOfUsersDisplayShowedFailAction,
  },
  changeGroupsApplicationEnabled: {
    validator: changeGroupsApplicationEnabledValidation,
    failAction,
  },
};
