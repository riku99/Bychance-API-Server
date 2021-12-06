import Joi from "joi";

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

export type ChangeTooltipOfUsersDisplayShowedPayload = {
  value: boolean;
};
const changeTooltipOfUsersDisplayShowedValidation = {
  payload: Joi.object<ChangeTooltipOfUsersDisplayShowedPayload>({
    value: Joi.boolean().required(),
  }),
};

export type ChangeGroupsApplicationEnabled = {
  value: boolean;
};
const changeGroupsApplicationEnabledValidation = {
  payload: Joi.object<ChangeGroupsApplicationEnabled>({
    value: Joi.boolean().required(),
  }),
};

export type ChangeDisplayPaylaod = {
  display: boolean;
};
const changeDisplayValidation = {
  payload: Joi.object<ChangeDisplayPaylaod>({
    display: Joi.boolean().required(),
  }),
};

export type ChangeVideoEditDescriptionPayload = {
  videoEditDescription: boolean;
};
const videoEditDesctiptionValidation = {
  payload: Joi.object<ChangeVideoEditDescriptionPayload>({
    videoEditDescription: Joi.boolean().required(),
  }),
};

export type ChangeTalkRoomMessageReceipt = {
  receipt: boolean;
};
const talkRoomMessageReceiptValidation = {
  payload: Joi.object<ChangeTalkRoomMessageReceipt>({
    receipt: Joi.boolean().required(),
  }),
};

export type ChangeShowReceiveMessage = {
  showReceiveMessage: boolean;
};
const changeShowReceiveMessageValidation = {
  payload: Joi.object<ChangeShowReceiveMessage>({
    showReceiveMessage: Joi.boolean().required(),
  }),
};

export type ChangeIntro = {
  intro: boolean;
};
const changeIntroValidation = {
  payload: Joi.object<ChangeIntro>({
    intro: Joi.boolean().required(),
  }),
};

export type CreateUserPayload = {
  name: string;
};
export type CreateUserHeader = {
  authorization: string;
};
const validationForCreateUser = {
  payload: Joi.object<CreateUserPayload>({
    name: Joi.string().required(),
  }),
  header: Joi.object<CreateUserHeader>({
    authorization: Joi.string().required(),
  }),
};

export type ChangeVideoCallingEnabled = {
  value: boolean;
};
const changeVideoCallingEnabledValidation = {
  paylaod: Joi.object<ChangeVideoCallingEnabled>({
    value: Joi.boolean().required(),
  }),
};

export type ChangeDescriptionOfVideoCallingSettingsShowed = {
  value: boolean;
};
const validationForChangeDescriptionOfVideoCallingSettingsShowed = {
  payload: Joi.object<ChangeDescriptionOfVideoCallingSettingsShowed>({
    value: Joi.boolean().required(),
  }),
};

// これまでユーザーの設定または「~を表示した」のような経験に関するカラムの部分もそれぞれバリデーションを定義していたが、基本的にbooleanで渡す値も同じなのでこれを使うようにする。
export type ChangeUserSettingsOrExperiencesValuePayload = {
  value: boolean;
};
const validationForUserSettingsOrExperiences = {
  payload: Joi.object<ChangeUserSettingsOrExperiencesValuePayload>({
    value: Joi.boolean().required(),
  }),
};

export const validators = {
  getUser: {
    validator: getValidation,
    failAction,
  },
  changeTooltipOfUsersDisplayShowed: {
    validator: changeTooltipOfUsersDisplayShowedValidation,
    failAction,
  },
  changeGroupsApplicationEnabled: {
    validator: changeGroupsApplicationEnabledValidation,
    failAction,
  },
  changeDisplay: {
    validator: changeDisplayValidation,
    failAction,
  },
  changeVideoEditDescription: {
    validator: videoEditDesctiptionValidation,
    failAction,
  },
  changeTalkRoomMessageReceipt: {
    validator: talkRoomMessageReceiptValidation,
    failAction,
  },
  changeShowReceiveMessage: {
    validator: changeShowReceiveMessageValidation,
    failAction,
  },
  changeIntro: {
    validator: changeIntroValidation,
    failAction,
  },
  createUser: {
    validater: validationForCreateUser,
    failAction,
  },
  changeVideoCallingEnabled: {
    validator: changeVideoCallingEnabledValidation,
    failAction,
  },
  changeDescriptionOfVideoCallingSettingsShowed: {
    validator: validationForChangeDescriptionOfVideoCallingSettingsShowed,
    failAction,
  },
  changeUserSettingsOrExperiencesValue: {
    validator: validationForUserSettingsOrExperiences,
    failAction,
  },
};
