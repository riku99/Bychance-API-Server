"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readTalkRoomMessagesRoute = void 0;
const url_1 = require("~/constants/url");
const validator_1 = require("./validator");
const readTalkRoomMessages_1 = require("~/handlers/readTalkRoomMessages");
const readTalkRoomMessagesRoute = async (server) => {
    server.route([
        {
            method: "POST",
            path: `${url_1.baseUrl}/readTalkRoomMessages`,
            handler: readTalkRoomMessages_1.readTalkRoomMessageHandler.createReadTalkRoomMessage,
            options: {
                validate: {
                    payload: validator_1.createReadTalkRoomMessagesValidator.validate.payload,
                    failAction: validator_1.createReadTalkRoomMessagesValidator.failAction,
                },
            },
        },
    ]);
};
exports.readTalkRoomMessagesRoute = readTalkRoomMessagesRoute;
