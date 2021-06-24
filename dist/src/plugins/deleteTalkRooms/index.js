"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTalkRoomsPlugin = void 0;
const deleteTalkRooms_1 = require("~/routes/deleteTalkRooms");
exports.deleteTalkRoomsPlugin = {
    name: "app/routes/deleteTalkRooms",
    register: deleteTalkRooms_1.deleteTalkRoomsRoute,
};
