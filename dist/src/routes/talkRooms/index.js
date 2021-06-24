"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.talkRoomsRoute = void 0;
const url_1 = require("~/constants/url");
const validator_1 = require("./validator");
const talkRooms_1 = require("~/handlers/talkRooms");
const talkRoomsRoute = async (server) => {
    server.route([
        {
            method: "POST",
            path: `${url_1.baseUrl}/talkRooms`,
            handler: talkRooms_1.talkRoomsHandler.createTalkRoom,
            options: {
                validate: {
                    payload: validator_1.createTalkRoomValidator.validate.payload,
                    failAction: validator_1.createTalkRoomValidator.failAction,
                },
            },
        },
        {
            method: "DELETE",
            path: `${url_1.baseUrl}/talkRooms/{talkRoomId}`,
            handler: talkRooms_1.talkRoomsHandler.deleteTalkRoom,
            options: {
                validate: {
                    params: validator_1.deleteTalkRoomValidator.validate.params,
                    failAction: validator_1.deleteTalkRoomValidator.failAction,
                },
            },
        },
    ]);
};
exports.talkRoomsRoute = talkRoomsRoute;
