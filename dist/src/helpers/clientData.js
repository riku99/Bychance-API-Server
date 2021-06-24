"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientData = void 0;
const user_1 = require("~/serializers/user");
const talkRoom_1 = require("~/serializers/talkRoom");
const talkRoomMessage_1 = require("~/serializers/talkRoomMessage");
const anotherUser_1 = require("~/helpers/anotherUser");
const flashes_1 = require("~/helpers/flashes");
const posts_1 = require("~/helpers/posts");
const createClientData = (data) => {
    const user = user_1.serializeUser({ user: data.user });
    const posts = posts_1.createClientPosts(data.posts);
    const flashes = flashes_1.createClientFlashes(data.flashes);
    let clientFlashStamps = [];
    const myFlashStampsData = flashes_1.createClientFlashStamps(data.flashes);
    clientFlashStamps.push(...myFlashStampsData);
    let talkRooms = [];
    let talkRoomMessages = [];
    const allTalkRooms = [...data.senderTalkRooms, ...data.recipientTalkRooms];
    allTalkRooms.forEach((talkRoom) => {
        // トークルームは存在しても作成相手からメッセージがきてない場合はrecipient側にはそのトークルームは表示させない。それを判断するために使うデータ
        let dataToBeDisplayed = false;
        // トークルームを作った側(sender側)ならその時点で表示させることを決定
        if (talkRoom.senderId === user.id) {
            dataToBeDisplayed = true;
        }
        talkRoom.messages.forEach((talkRoomMessage) => {
            // そのルームの受け取り側(recipient)でも相手からのメッセージが既に存在する場合(recieptがtrue)は表示させることを決定
            if (!dataToBeDisplayed &&
                talkRoomMessage.userId !== user.id &&
                talkRoomMessage.receipt) {
                dataToBeDisplayed = true;
            }
            // talkRoomMessageのrecieptがfalseでも送ったのが自分の場合は追加する。falseでかつ相手から送られてきたものの場合表示させないので追加しない
            if (talkRoomMessage.receipt || talkRoomMessage.userId === data.user.id) {
                const serializedMessage = talkRoomMessage_1.serializeTalkRoomMessage({ talkRoomMessage });
                talkRoomMessages.push(serializedMessage);
            }
        });
        if (dataToBeDisplayed) {
            const readTalkRoomMessages = data.readTalkRoomMessages.filter((readMessage) => readMessage.roomId === talkRoom.id);
            const serializedRoom = talkRoom_1.serializeTalkRoom({
                talkRoom,
                talkRoomMessages: talkRoom.messages,
                readTalkRoomMessages,
                userId: data.user.id,
            });
            talkRooms.push(serializedRoom);
        }
    });
    const recipients = data.senderTalkRooms.map((talkRoom) => talkRoom.recipient);
    const senders = data.recipientTalkRooms.map((talkRoom) => talkRoom.sender);
    const recipientsAndSenders = [...recipients, ...senders];
    const chatPartners = recipientsAndSenders.map((user) => {
        const { posts, flashes, ...restUserData } = user;
        const chatpartnerFlashStampsData = flashes_1.createClientFlashStamps(flashes);
        clientFlashStamps.push(...chatpartnerFlashStampsData);
        return anotherUser_1.createAnotherUser({
            user: restUserData,
            posts,
            flashes,
            viewedFlashes: data.viewedFlashes,
        });
    });
    const clietnData = {
        user,
        posts,
        flashes,
        rooms: talkRooms,
        messages: talkRoomMessages,
        chatPartners,
        flashStamps: clientFlashStamps,
    };
    return clietnData;
};
exports.createClientData = createClientData;
