import Joi, { boolean } from "joi";
import { User } from "@prisma/client";

import { throwInvalidError } from "~/helpers/errors";

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

export type ChangeVideoEditDescriptionPayload = {
  videoEditDescription: boolean;
};

const videoEditDesctiptionValidation = {
  payload: Joi.object<ChangeVideoEditDescriptionPayload>({
    videoEditDescription: Joi.boolean().required(),
  }),
};

const videoEditDescriptionFailAction = () => throwInvalidError();

export const changeVideoEditDescriptionValidator = {
  validator: videoEditDesctiptionValidation,
  failAction: videoEditDescriptionFailAction,
};

export type ChangeTalkRoomMessageReceipt = {
  receipt: boolean;
};

const talkRoomMessageReceiptValidation = {
  payload: Joi.object<ChangeTalkRoomMessageReceipt>({
    receipt: Joi.boolean().required(),
  }),
};

const talkRoomMessageReceiptFailAction = () => throwInvalidError();

export const changeTalkRoomMessageReceiptValidator = {
  validator: talkRoomMessageReceiptValidation,
  failAction: talkRoomMessageReceiptFailAction,
};
