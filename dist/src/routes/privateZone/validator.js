"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateZoneValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const errors_1 = require("~/helpers/errors");
const createValidation = {
    payload: joi_1.default.object({
        address: joi_1.default.string().required(),
        lat: joi_1.default.number().required(),
        lng: joi_1.default.number().required(),
    }),
};
const createFailAction = () => errors_1.throwInvalidError();
const deleteValidation = {
    params: joi_1.default.object({
        id: joi_1.default.string().required(),
    }),
};
const deleteFailAction = () => errors_1.throwInvalidError();
exports.privateZoneValidator = {
    create: {
        validator: createValidation,
        failAction: createFailAction,
    },
    delete: {
        validator: deleteValidation,
        failAction: deleteFailAction,
    },
};
