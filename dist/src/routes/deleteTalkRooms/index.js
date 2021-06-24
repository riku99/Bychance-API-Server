"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTalkRoomsRoute = void 0;
const url_1 = require("~/constants/url");
const validator_1 = require("./validator");
const deleteTalkRooms_1 = require("~/handlers/deleteTalkRooms");
// 実際にDBから削除するわけではなく、「削除した」というデータを残すためのルート。なので DELETE /taklRooms での対応にはしない
const deleteTalkRoomsRoute = (server) => {
    server.route([
        {
            method: "POST",
            path: `${url_1.baseUrl}/deleteTalkRooms`,
            handler: deleteTalkRooms_1.deleteTalkRoomsHandler.createDeleteTalkRoom,
            options: {
                validate: {
                    payload: validator_1.createDeleteTalkRoomValidator.validate.payload,
                    failAction: validator_1.createDeleteTalkRoomValidator.failAction,
                },
            },
        },
    ]);
};
exports.deleteTalkRoomsRoute = deleteTalkRoomsRoute;
