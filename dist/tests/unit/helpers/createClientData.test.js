"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_1 = require("../../data");
const clientData_1 = require("~/helpers/clientData");
const clientData = {
    user: data_1.clientUser,
    posts: [data_1.clientPost],
    flashes: [data_1.clientFlash],
    rooms: [data_1.clientTalkRoom],
    messages: [data_1.clietnTalkRoomMessage],
    chatPartners: [],
};
describe("create clientData", () => {
    test("clientDataを返す", () => {
        const result = clientData_1.createClientData({
            user: data_1.user,
            posts: [data_1.post],
            flashes: [data_1.flash],
            senderTalkRooms: [],
            recipientTalkRooms: [],
            viewedFlashes: [],
            readTalkRoomMessages: [data_1.readTalkRoomMessage],
        });
        result.flashes[0].timestamp = "timestamp";
        result.rooms[0].timestamp = "timestamp";
        result.messages[0].timestamp = "timestamp";
        console.log(result);
        expect(result).toEqual(clientData);
    });
});
