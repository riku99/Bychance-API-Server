"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.talkRoomMessagesPlugin = void 0;
const talkRoomMessages_1 = require("~/routes/talkRoomMessages");
exports.talkRoomMessagesPlugin = {
    name: "app/routes/talkRoomMessages",
    register: talkRoomMessages_1.talkRoomMessagesRoute,
};
