"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeTalkRoomMessage = void 0;
const serializeTalkRoomMessage = ({ talkRoomMessage, }) => {
    const { id, userId, roomId, text } = talkRoomMessage;
    const timestamp = talkRoomMessage.createdAt.toString();
    const clientMessage = {
        id,
        userId,
        roomId,
        text,
        timestamp,
    };
    return clientMessage;
};
exports.serializeTalkRoomMessage = serializeTalkRoomMessage;
