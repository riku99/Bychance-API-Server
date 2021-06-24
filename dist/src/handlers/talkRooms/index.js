"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.talkRoomsHandler = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createTalkRoom = async (req, h) => {
    const user = req.auth.artifacts;
    const payload = req.payload;
    const talkRooms = await prisma.talkRoom.findMany({
        where: {
            OR: [
                {
                    senderId: user.id,
                    recipientId: payload.partnerId,
                },
                {
                    senderId: payload.partnerId,
                    recipientId: user.id,
                },
            ],
        },
    });
    const existingTalkRoom = talkRooms.length ? talkRooms[0] : null;
    if (existingTalkRoom) {
        const deleteData = await prisma.deleteTalkRoom.findUnique({
            where: {
                userId_talkRoomId: {
                    userId: user.id,
                    talkRoomId: existingTalkRoom.id,
                },
            },
        });
        if (!deleteData) {
            return {
                presence: true,
                roomId: existingTalkRoom.id,
                timestamp: existingTalkRoom.updatedAt.toString(),
            };
        }
    }
    const newTalkRoom = await prisma.talkRoom.create({
        data: {
            senderId: user.id,
            recipientId: payload.partnerId,
        },
    });
    return {
        presence: false,
        roomId: newTalkRoom.id,
        timestamp: newTalkRoom.createdAt.toString(),
    };
};
const deleteTalkRoom = async (req, h) => {
    const params = req.params;
    await prisma.readTalkRoomMessage.deleteMany({
        where: {
            roomId: params.talkRoomId,
        },
    });
    await prisma.talkRoomMessage.deleteMany({
        where: {
            roomId: params.talkRoomId,
        },
    });
    // トークルームを削除しようとした時点で相手がその前に削除していた場合このprismaによるdeletrはエラーになる。なのでtryでエスケープする
    try {
        await prisma.talkRoom.delete({
            where: {
                id: params.talkRoomId,
            },
        });
    }
    catch { }
    return h.response().code(200);
};
exports.talkRoomsHandler = {
    createTalkRoom,
    deleteTalkRoom,
};
