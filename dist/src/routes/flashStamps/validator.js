"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFlashStampValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const errors_1 = require("~/helpers/errors");
const createValidation = {
    payload: joi_1.default.object({
        flashId: joi_1.default.number().required(),
        value: joi_1.default.string()
            .valid("thumbsUp", "yusyo", "yoi", "itibann", "seikai")
            .required(),
    }),
};
const createFaliAction = () => errors_1.throwInvalidError();
exports.createFlashStampValidator = {
    validate: createValidation,
    failAction: createFaliAction,
};
