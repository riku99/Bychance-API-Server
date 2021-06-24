"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTalkRoomMessagesPlugin = void 0;
const readTalkRoomMessages_1 = require("~/routes/readTalkRoomMessages");
exports.readTalkRoomMessagesPlugin = {
    name: "app/routes/readTalkRoomMessages",
    register: readTalkRoomMessages_1.readTalkRoomMessagesRoute,
};
