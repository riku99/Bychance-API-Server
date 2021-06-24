"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNonceValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const errors_1 = require("~/helpers/errors");
const create = joi_1.default.object({
    nonce: joi_1.default.string().required(),
});
// バリデーションエラーなので400を返すのが一般的だが、再度ログインプロセスを踏ませたいので401でloginError返す
const createFailAction = () => {
    return errors_1.throwLoginError();
};
exports.createNonceValidator = {
    validate: create,
    failAction: createFailAction,
};
