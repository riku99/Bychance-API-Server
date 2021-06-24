"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTalkRoomValidator = exports.createTalkRoomValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const errors_1 = require("~/helpers/errors");
const createValidation = {
    payload: joi_1.default.object({
        partnerId: joi_1.default.string().required(),
    }),
};
const createFailAction = () => errors_1.throwInvalidError();
exports.createTalkRoomValidator = {
    validate: createValidation,
    failAction: createFailAction,
};
const deleteValidation = {
    params: joi_1.default.object({
        talkRoomId: joi_1.default.number().required(),
    }),
};
const deleteFailAction = () => errors_1.throwInvalidError();
exports.deleteTalkRoomValidator = {
    validate: deleteValidation,
    failAction: deleteFailAction,
};
