"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const flash_1 = require("~/serializers/flash");
const data_1 = require("../../data");
describe("flash serializer", () => {
    test("clientFlashを返す", () => {
        const result = flash_1.serializeFlash({ flash: data_1.flash });
        result.timestamp = "timestamp";
        expect(result).toEqual(data_1.clientFlash);
    });
});
