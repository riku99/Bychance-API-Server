"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePostValidator = exports.createPostValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const errors_1 = require("~/helpers/errors");
const createValidation = {
    payload: joi_1.default.object({
        text: joi_1.default.string().allow("").max(150).required(),
        source: joi_1.default.string().required(),
        sourceType: joi_1.default.string().valid("image", "video").required(),
        ext: joi_1.default.string().required(),
    }),
};
const createFailAction = () => {
    return errors_1.throwInvalidError();
};
exports.createPostValidator = {
    validate: createValidation,
    failAction: createFailAction,
};
const deletePostValidation = {
    payload: joi_1.default.object({
        postId: joi_1.default.number().required(),
    }),
};
const deleteFailAction = () => {
    return errors_1.throwInvalidError();
};
exports.deletePostValidator = {
    validate: deletePostValidation,
    failAction: deleteFailAction,
};
