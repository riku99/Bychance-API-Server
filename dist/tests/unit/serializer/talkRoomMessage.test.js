"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const talkRoomMessage_1 = require("~/serializers/talkRoomMessage");
const data_1 = require("../../data");
describe("talkRoomMessage serializer", () => {
    test("lietnTalkRoomMessagを返す", () => {
        const result = talkRoomMessage_1.serializeTalkRoomMessage({ talkRoomMessage: data_1.talkRoomMessage });
        result.timestamp = "timestamp";
        expect(result).toEqual(data_1.clietnTalkRoomMessage);
    });
});
