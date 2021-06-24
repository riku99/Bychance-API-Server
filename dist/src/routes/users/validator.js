"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeShowReceiveMessageValidator = exports.changeTalkRoomMessageReceiptValidator = exports.changeVideoEditDescriptionValidator = exports.changeUserDisplayValidator = exports.updateLocationValidator = exports.refreshUserValidator = exports.updateUserValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const errors_1 = require("~/helpers/errors");
const update = {
    payload: joi_1.default.object({
        name: joi_1.default.string().required(),
        avatar: joi_1.default.string().optional(),
        avatarExt: joi_1.default.string().allow(null).optional(),
        introduce: joi_1.default.string().allow("").required(),
        statusMessage: joi_1.default.string().allow("").required(),
        deleteAvatar: joi_1.default.boolean().required(),
        backGroundItem: joi_1.default.string().optional(),
        backGroundItemType: joi_1.default.string().valid("image", "video").optional(),
        deleteBackGroundItem: joi_1.default.boolean().required(),
        backGroundItemExt: joi_1.default.string().allow(null).optional(),
        instagram: joi_1.default.string().allow(null),
        twitter: joi_1.default.string().allow(null),
        youtube: joi_1.default.string().allow(null),
        tiktok: joi_1.default.string().allow(null),
    }),
};
const updateFailAction = () => {
    return errors_1.throwInvalidError("無効なデータが含まれています");
};
exports.updateUserValidator = {
    validate: update,
    failAction: updateFailAction,
};
const refresh = {
    payload: joi_1.default.object({
        userId: joi_1.default.string().required(),
    }),
};
const refreshFailAction = () => {
    return errors_1.throwInvalidError();
};
exports.refreshUserValidator = {
    validate: refresh,
    failAction: refreshFailAction,
};
const location = {
    payload: joi_1.default.object({
        lat: joi_1.default.number().required(),
        lng: joi_1.default.number().required(),
    }),
};
const locationFailAction = () => {
    return errors_1.throwInvalidError();
};
exports.updateLocationValidator = {
    validate: location,
    failAction: locationFailAction,
};
const displayValidation = {
    payload: joi_1.default.object({
        display: joi_1.default.boolean().required(),
    }),
};
const changeUserDisplayFailAction = () => {
    return errors_1.throwInvalidError();
};
exports.changeUserDisplayValidator = {
    validator: displayValidation,
    failAction: changeUserDisplayFailAction,
};
const videoEditDesctiptionValidation = {
    payload: joi_1.default.object({
        videoEditDescription: joi_1.default.boolean().required(),
    }),
};
const videoEditDescriptionFailAction = () => errors_1.throwInvalidError();
exports.changeVideoEditDescriptionValidator = {
    validator: videoEditDesctiptionValidation,
    failAction: videoEditDescriptionFailAction,
};
const talkRoomMessageReceiptValidation = {
    payload: joi_1.default.object({
        receipt: joi_1.default.boolean().required(),
    }),
};
const talkRoomMessageReceiptFailAction = () => errors_1.throwInvalidError();
exports.changeTalkRoomMessageReceiptValidator = {
    validator: talkRoomMessageReceiptValidation,
    failAction: talkRoomMessageReceiptFailAction,
};
const changeShowReceiveMessageValidation = {
    payload: joi_1.default.object({
        showReceiveMessage: joi_1.default.boolean().required(),
    }),
};
exports.changeShowReceiveMessageValidator = {
    validator: changeShowReceiveMessageValidation,
    failAction: () => errors_1.throwInvalidError(),
};
