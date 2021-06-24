"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTalkRoomMessage = exports.clietnTalkRoomMessage = exports.talkRoomMessage = exports.clientTalkRoom = exports.talkRoom = exports.clientFlash = exports.flash = exports.clientPost = exports.post = exports.clientUser = exports.user = void 0;
exports.user = {
    id: "1",
    lineId: "lineline",
    name: "sutehage",
    avatar: "ava",
    introduce: "Hey!",
    statusMessage: "hello",
    display: true,
    createdAt: new Date("2021-04-01"),
    updatedAt: new Date("2021-04-01"),
    accessToken: "token",
    lat: "here",
    lng: "here",
};
exports.clientUser = {
    id: "1",
    name: "sutehage",
    avatar: "ava",
    introduce: "Hey!",
    statusMessage: "hello",
    display: true,
    lat: 1,
    lng: 2,
};
exports.post = {
    id: 1,
    image: "image",
    text: "text",
    createdAt: new Date("2021-04-29T07:11:50.036Z"),
    updatedAt: new Date("2021-04-29T07:11:50.036Z"),
    userId: "userId",
};
exports.clientPost = {
    id: 1,
    image: "image",
    text: "text",
    userId: "userId",
    date: "2021/4/29",
};
exports.flash = {
    id: 1,
    source: "sourceURL",
    sourceType: "image",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "1",
};
exports.clientFlash = {
    id: 1,
    source: "sourceURL",
    sourceType: "image",
    timestamp: "timestamp",
};
exports.talkRoom = {
    id: 1,
    createdAt: new Date("2021-04-29T07:11:50.036Z"),
    updatedAt: new Date("2021-04-29T07:11:50.036Z"),
    senderId: "1",
    recipientId: "2",
};
exports.clientTalkRoom = {
    id: 1,
    partner: "2",
    //messages: [1, 2, 3, 4, 5],
    messages: [1],
    unreadNumber: 0,
    latestMessage: "Hey",
    timestamp: "timestamp",
};
exports.talkRoomMessage = {
    id: 1,
    userId: "1",
    roomId: 1,
    text: "Hey",
    createdAt: new Date("2021-04-29T07:11:50.036Z"),
    updatedAt: new Date("2021-04-29T07:11:50.036Z"),
};
exports.clietnTalkRoomMessage = {
    id: 1,
    userId: "1",
    roomId: 1,
    text: "Hey",
    timestamp: "timestamp",
};
exports.readTalkRoomMessage = {
    id: 1,
    userId: "2",
    messageId: 1,
    roomId: 1,
    createdAt: new Date("2021-04-29T07:11:50.036Z"),
    updatedAt: new Date("2021-04-29T07:11:50.036Z"),
};
// export const talkRoomMessages: TalkRoomMessage[] = [
//   {
//     id: 1,
//     text: "久しぶり",
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//     userId: "1",
//     roomId: 1,
//   },
//   {
//     id: 2,
//     text: "どうしたの?",
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//     userId: "2",
//     roomId: 1,
//   },
//   {
//     id: 3,
//     text: "今電話できる?",
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//     userId: "1",
//     roomId: 1,
//   },
//   {
//     id: 4,
//     text: "なんで?",
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//     userId: "2",
//     roomId: 1,
//   },
//   {
//     id: 5,
//     text: "話したいことある",
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//     userId: "1",
//     roomId: 1,
//   },
// ];
// export const readTalkRoomMessages: ReadTalkRoomMessage[] = [
//   {
//     id: 1,
//     userId: "2",
//     messageId: 1,
//     roomId: 1,
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//   },
//   {
//     id: 2,
//     userId: "1",
//     messageId: 2,
//     roomId: 1,
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//   },
//   {
//     id: 3,
//     userId: "2",
//     messageId: 3,
//     roomId: 1,
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//   },
//   {
//     id: 4,
//     userId: "1",
//     messageId: 4,
//     roomId: 1,
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//   },
// ];
