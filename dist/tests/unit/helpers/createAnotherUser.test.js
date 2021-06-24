"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const anotherUser_1 = require("~/helpers/anotherUser");
const user = {
    id: "1",
    name: "コベニ",
    accessToken: "token",
    lineId: "lineId",
    introduce: "hello",
    avatar: "image url",
    statusMessage: "hey",
    display: false,
    lat: "1",
    lng: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
};
const post = {
    id: 1,
    text: "Wow",
    image: "url",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "1",
};
const serializedPost = {
    id: post.id,
    text: post.text,
    image: "url",
    date: "date",
    userId: "1",
};
const flash = {
    id: 1,
    source: "url",
    sourceType: "image",
    userId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
};
const serializedFlash = {
    id: flash.id,
    source: flash.source,
    sourceType: flash.sourceType,
    timestamp: "timestamp",
};
const viewedFlash = {
    id: 1,
    userId: "2",
    flashId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
};
const expectedResult = {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    introduce: user.introduce,
    statusMessage: user.statusMessage,
    posts: [serializedPost],
    flashes: {
        entities: [serializedFlash],
        alreadyViewed: [1],
        isAllAlreadyViewed: true,
    },
};
describe("createAnotherUser", () => {
    test("expectedResultを返す", () => {
        const result = anotherUser_1.createAnotherUser({
            user,
            posts: [post],
            flashes: [flash],
            viewedFlashes: [viewedFlash],
        });
        console.log(result);
        result.posts[0].date = serializedPost.date;
        result.flashes.entities[0].timestamp = serializedFlash.timestamp;
        expect(result).toEqual(expectedResult);
    });
});
