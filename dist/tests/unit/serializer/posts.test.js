"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_1 = require("~/serializers/post");
const data_1 = require("../../data");
describe("posts serializer", () => {
    test("clentPostを返す", () => {
        const result = post_1.serializePost({ post: data_1.post });
        expect(result).toEqual(data_1.clientPost);
    });
});
