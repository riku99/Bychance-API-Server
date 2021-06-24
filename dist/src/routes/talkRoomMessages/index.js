"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.talkRoomMessagesRoute = void 0;
const url_1 = require("~/constants/url");
const validator_1 = require("./validator");
const talkRoomMessages_1 = require("~/handlers/talkRoomMessages");
const talkRoomMessagesRoute = async (server) => {
    server.route([
        {
            method: "POST",
            path: `${url_1.baseUrl}/talkRoomMessages`,
            handler: talkRoomMessages_1.talkRoomMessagesHandler.createTalkRoomMessage,
            options: {
                validate: {
                    payload: validator_1.createTalkRoomMessageValidator.validate.payload,
                    failAction: validator_1.createTalkRoomMessageValidator.failAction,
                },
            },
        },
    ]);
};
exports.talkRoomMessagesRoute = talkRoomMessagesRoute;
