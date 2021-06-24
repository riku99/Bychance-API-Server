"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTalkRoomsHandler = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// 名前わかりづらいけど DeleteTalkRoom というデータを作成する、という意味
const createDeleteTalkRoom = async (req, h) => {
    const user = req.auth.artifacts;
    const payload = req.payload;
    await prisma.deleteTalkRoom.create({
        data: {
            talkRoomId: payload.talkRoomId,
            userId: user.id,
        },
    });
    return h.response().code(200);
};
exports.deleteTalkRoomsHandler = {
    createDeleteTalkRoom,
};
