"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const talkRoom_1 = require("~/serializers/talkRoom");
const data_1 = require("../../data");
describe("talkRoom serializer", () => {
    test("clientTalkRoomを返す", () => {
        const result = talkRoom_1.serializeTalkRoom({
            talkRoom: data_1.talkRoom,
            talkRoomMessages: [data_1.talkRoomMessage],
            readTalkRoomMessages: [data_1.readTalkRoomMessage],
            userId: "1",
        });
        result.timestamp = "timestamp";
        expect(result).toEqual(data_1.clientTalkRoom);
    });
});
