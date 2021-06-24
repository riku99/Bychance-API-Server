"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwInvalidError = exports.throwLoginError = void 0;
const boom_1 = __importDefault(require("@hapi/boom"));
const errors_1 = require("~/config/apis/errors");
const throwLoginError = () => {
    const error = boom_1.default.unauthorized();
    error.output.payload.errorType = errors_1.loginErrorType;
    throw error;
};
exports.throwLoginError = throwLoginError;
const throwInvalidError = (message = "無効なリクエストです") => {
    const error = boom_1.default.badRequest();
    error.output.payload.message = message;
    error.output.payload.errorType = errors_1.invalidErrorType;
    throw error;
};
exports.throwInvalidError = throwInvalidError;
