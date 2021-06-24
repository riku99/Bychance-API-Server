"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientIncludes = exports.flashIncludes = exports.postIncludes = void 0;
exports.postIncludes = {
    posts: {
        orderBy: {
            createdAt: "desc",
        },
    },
};
exports.flashIncludes = {
    flashes: {
        include: {
            viewed: true,
            stamps: true,
        },
    },
};
exports.createClientIncludes = {
    ...exports.postIncludes,
    ...exports.flashIncludes,
    talkRoomMessages: true,
    readTalkRoomMessages: true,
    viewedFlashes: true,
    senderTalkRooms: {
        include: {
            // 送信したのが自分でも他人でもこのトークルームに所属するメッセージは全て取得したいのでincludeにmessagesをつける
            messages: true,
            // TalkRoomにはsenderとrecipientの2つのユーザーデータが保存されている。相手のデータを取得したいのでsenedrのリレーションでTalkRoomを取得した場合はrecipientをincludeする
            recipient: {
                include: {
                    ...exports.postIncludes,
                    ...exports.flashIncludes,
                },
            },
        },
    },
    recipientTalkRooms: {
        include: {
            messages: true,
            sender: {
                include: {
                    ...exports.postIncludes,
                    ...exports.flashIncludes,
                },
            },
        },
    },
};
