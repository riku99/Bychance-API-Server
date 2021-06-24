"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionsValidator = exports.lineLoginValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const errors_1 = require("~/helpers/errors");
exports.lineLoginValidator = {
    headers: joi_1.default.object({
        authorization: joi_1.default.string().required(),
    }),
};
const lineLoginFailAction = (req, h, err) => {
    // ヘッダの有無でバリデーションしていて、バリデーションエラーなら400を返すのが一般的かと思うが、今回は再度ログインプロセスをユーザーに踏ませたいので、ここの場合のバリデーションエラーは401を返す
    return errors_1.throwLoginError();
};
// const emailAndPass = () => {}; セッションを構築する方法は複数になることが考えられるので分ける
exports.sessionsValidator = {
    lineLogin: {
        validate: exports.lineLoginValidator,
        failAction: lineLoginFailAction,
    },
};
