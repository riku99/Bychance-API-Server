"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.talkRoomsPlugin = void 0;
const talkRooms_1 = require("~/routes/talkRooms");
exports.talkRoomsPlugin = {
    name: "app/routes/talkRooms",
    register: talkRooms_1.talkRoomsRoute,
};
