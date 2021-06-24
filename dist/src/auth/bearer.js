"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBeareAccessToken = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = require("~/helpers/crypto");
const prisma = new client_1.PrismaClient();
// 認可が必要なAPIのAuthorizationヘッダ + クエリのidフィールドはこの認可プロセスで検証を行えるのでそのためのバリデーションは定義する必要ない
const checkBeareAccessToken = async (request, token, h) => {
    const id = request.query.id;
    if (!id) {
        // Boomを使ったエラーのスローはstrategy作成時のunauthorizeに実装する
        // throwLoginError();
        return { isValid: false, credentials: {} };
    }
    const user = await prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        return { isValid: false, credentials: {} };
    }
    const isSame = user.accessToken === crypto_1.createHash(token);
    if (!isSame) {
        return { isValid: false, credentials: {} };
    }
    // credentialsは例えisValidがfalseでも、trueだがhandler内で必要なくても定義しないとダメ
    return { isValid: true, credentials: {}, artifacts: user };
};
exports.checkBeareAccessToken = checkBeareAccessToken;
