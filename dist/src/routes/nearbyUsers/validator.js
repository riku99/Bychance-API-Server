"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearbyUsersValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const errors_1 = require("~/helpers/errors");
const getValidation = {
    query: joi_1.default.object({
        lat: joi_1.default.number().required(),
        lng: joi_1.default.number().required(),
        range: joi_1.default.number().required(),
        id: joi_1.default.string().required(), // クエリには認証用idが毎回含まれるので、クエリをバリデーションの対象にする場合はidも許可する
    }),
};
const getFailAction = () => errors_1.throwInvalidError();
exports.getNearbyUsersValidator = {
    validate: getValidation,
    failAction: getFailAction,
};
