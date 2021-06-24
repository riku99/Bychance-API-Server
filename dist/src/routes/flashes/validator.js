"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFlashValidator = exports.createFlashValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const errors_1 = require("~/helpers/errors");
const createValidation = {
    payload: joi_1.default.object({
        source: joi_1.default.string().required(),
        sourceType: joi_1.default.string().valid("image", "video").required(),
        ext: joi_1.default.string().required(),
    }),
};
const createFailAction = () => errors_1.throwInvalidError();
exports.createFlashValidator = {
    validate: createValidation,
    failAction: createFailAction,
};
const deleteValidation = {
    params: joi_1.default.object({
        flashId: joi_1.default.string().required(),
    }),
};
const deleteFailAciton = () => errors_1.throwInvalidError();
exports.deleteFlashValidator = {
    validate: deleteValidation,
    failAction: deleteFailAciton,
};
