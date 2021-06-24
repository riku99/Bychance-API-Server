"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("~/serializers/user");
const data_1 = require("../../data");
describe("users serializer", () => {
    test("シリアライズされてclientUserが返される", () => {
        const result = user_1.serializeUser({ user: data_1.user });
        expect(result).toEqual(data_1.clientUser);
    });
});
