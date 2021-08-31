import Joi from "joi";

import { throwInvalidError } from "~/helpers/errors";

const failAction = () => throwInvalidError();

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

export const validators = {
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
};
