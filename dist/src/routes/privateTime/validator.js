"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateTimeValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const errors_1 = require("~/helpers/errors");
const createValidation = {
    payload: joi_1.default.object({
        startHours: joi_1.default.number().required(),
        startMinutes: joi_1.default.number().required(),
        endHours: joi_1.default.number().required(),
        endMinutes: joi_1.default.number().required(),
    }),
};
const createFailAction = () => errors_1.throwInvalidError();
const deletePrivateTimeValidation = {
    params: joi_1.default.object({
        id: joi_1.default.string().required(),
    }),
};
const deltePrivateTimeFailAction = () => errors_1.throwInvalidError();
exports.privateTimeValidator = {
    create: {
        validator: createValidation,
        failAction: createFailAction,
    },
    delete: {
        validator: deletePrivateTimeValidation,
        failAction: deltePrivateTimeFailAction,
    },
};
