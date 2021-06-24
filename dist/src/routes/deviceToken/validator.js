"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeviceTokenValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const errors_1 = require("~/helpers/errors");
const createValidation = {
    payload: joi_1.default.object({
        token: joi_1.default.string().required(),
    }),
};
const createFailAction = () => errors_1.throwInvalidError();
exports.createDeviceTokenValidator = {
    validate: createValidation,
    failAction: createFailAction,
};
