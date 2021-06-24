"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.talkRoomMessagesHandler = void 0;
const client_1 = require("@prisma/client");
const talkRoomMessage_1 = require("~/serializers/talkRoomMessage");
const talkRoom_1 = require("~/serializers/talkRoom");
const server_1 = require("~/server");
const errors_1 = require("~/helpers/errors");
const anotherUser_1 = require("~/helpers/anotherUser");
const pushNotification_1 = require("~/helpers/pushNotification");
const prisma = new client_1.PrismaClient();
const createTalkRoomMessage = async (req, h) => {
    const user = req.auth.artifacts;
    const payload = req.payload;
    const partner = await prisma.user.findUnique({
        where: {
            id: payload.partnerId,
        },
        include: {
            readTalkRoomMessages: true,
        },
    });
    if (!partner) {
        return errors_1.throwInvalidError("ユーザーが存在しません");
    }
    const room = await prisma.talkRoom.findUnique({
        where: {
            id: payload.talkRoomId,
        },
    });
    // 既にルームが削除されていた場合はその時点でリターン。メッセージのデータも作成しなくて良い
    if (!room) {
        return {
            talkRoomPresence: false,
            talkRoomId: payload.talkRoomId,
        };
    }
    const talkRoomMessage = await prisma.talkRoomMessage.create({
        data: {
            userId: user.id,
            roomId: payload.talkRoomId,
            text: payload.text,
            receipt: partner.talkRoomMessageReceipt, // 送信相手のtalkRoomMessageReceiptがfalseなら「受け取られない」という意味でrecieptがfalseになる
        },
    });
    const clientMessage = talkRoomMessage_1.serializeTalkRoomMessage({ talkRoomMessage });
    // 送信相手がログアウト中 or メッセージを受け取らない設定にしている場合はこの時点でリターン。push通知もsocketのイベントも起こさない
    if (!partner.talkRoomMessageReceipt || !partner.login) {
        return {
            talkRoomPresence: true,
            message: clientMessage,
            talkRoomId: payload.talkRoomId,
        };
    }
    // 送信者から見たらそれは初回メッセージではなくても、受け取る側から見たらそれは初回メッセージの可能性がある(相手がメッセージを送った時に受け取りがfalseになってる時とか)
    // なので初回メッセージかどうかはpayloadの情報(送信者から見たデータ)ではなく、受け取り側視点も考慮しなければいけない
    const allMessagesBelongingToTheTalkRoom = await prisma.talkRoomMessage.findMany({
        where: {
            roomId: payload.talkRoomId,
        },
    });
    const firstMessageSent = allMessagesBelongingToTheTalkRoom.find((m) => m.userId === payload.partnerId && m.receipt);
    let ioData;
    // このメッセージが送信相手との初めてのメッセージか否かで処理分ける
    if (firstMessageSent) {
        const sender = await prisma.user.findUnique({
            where: { id: user.id },
        });
        if (!sender) {
            return errors_1.throwInvalidError();
        }
        // トークルームが新規のものでなく既に存在している場合はメッセージのみをwsで送れば良い
        ioData = {
            isFirstMessage: false,
            roomId: payload.talkRoomId,
            message: clientMessage,
            sender: {
                id: sender.id,
                avatar: sender.avatar,
                name: sender.name,
            },
            show: partner.showReceiveMessage,
        };
    }
    else {
        const sender = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                posts: true,
                flashes: {
                    include: {
                        viewed: true,
                        stamps: true,
                    },
                },
                viewedFlashes: true,
            },
        });
        const room = await prisma.talkRoom.findUnique({
            where: { id: payload.talkRoomId },
            include: { messages: true },
        });
        if (!room) {
            return errors_1.throwInvalidError();
        }
        const { messages, ...restRoomData } = room;
        const readTalkRoomMessages = await prisma.readTalkRoomMessage.findMany({
            where: {
                userId: payload.partnerId,
            },
        });
        if (!sender) {
            return errors_1.throwInvalidError("ユーザーが存在しません");
        }
        const { posts, flashes, viewedFlashes, ...restSenderData } = sender;
        const serializedRoom = talkRoom_1.serializeTalkRoom({
            talkRoom: restRoomData,
            talkRoomMessages: messages,
            readTalkRoomMessages,
            userId: payload.partnerId,
        });
        const clientSenderData = anotherUser_1.createAnotherUser({
            user: restSenderData,
            posts,
            flashes,
            viewedFlashes,
        });
        // トークルームが新規のものの場合は相手にメッセージ + トークルームと送信したユーザーのデータも送る
        ioData = {
            isFirstMessage: true,
            room: serializedRoom,
            message: clientMessage,
            sender: clientSenderData,
            show: partner.showReceiveMessage,
        };
    }
    server_1.talkRoomMessageNameSpace
        .to(payload.partnerId)
        .emit("recieveTalkRoomMessage", ioData);
    const tokenData = await prisma.deviceToken.findMany({
        where: {
            userId: payload.partnerId,
        },
    });
    const tokens = tokenData.map((data) => data.token);
    pushNotification_1.pushNotificationToMany({
        tokens,
        notification: {
            title: "メッセージが届きました",
        },
        data: {
            type: "talkRoomMessages",
            talkRoomId: String(payload.talkRoomId),
            partnerId: user.id, // 送信相手から見たパートナー(リクエストしたユーザー)
        },
        apns: {
            payload: {
                aps: {
                    sound: "default",
                    contentAvailable: true,
                },
            },
        },
    });
    return {
        talkRoomPresence: true,
        message: clientMessage,
        talkRoomId: payload.talkRoomId,
    };
};
exports.talkRoomMessagesHandler = {
    createTalkRoomMessage,
};
