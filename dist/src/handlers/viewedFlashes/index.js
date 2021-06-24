"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewedFlashHandler = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createViewedFlash = async (req, h) => {
    const user = req.auth.artifacts;
    const payload = req.payload;
    const existing = await prisma.viewedFlash.findUnique({
        where: {
            userId_flashId_unique: {
                userId: user.id,
                flashId: payload.flashId,
            },
        },
    });
    if (existing) {
        return h.response().code(200);
    }
    // viewedFlashを作る時のFlashがもう削除されている場合がある。prismaは失敗するとエラーを出すので、これにより500エラーがクライアントに返る。このエラーを解決したい。
    // 作成する前にFlashの存在を確かめるのでも解決するが、毎回やるのもあれなのでtry構文で囲ってエラー処理する。
    // 作成失敗しても特に問題はないし、エラー処理も今のところ特にする必要もないのでただtryの中に入れた形になっている
    try {
        await prisma.viewedFlash.create({
            data: {
                flashId: payload.flashId,
                userId: user.id,
            },
        });
    }
    catch { }
    return h.response().code(200);
};
exports.viewedFlashHandler = {
    createViewedFlash,
};
