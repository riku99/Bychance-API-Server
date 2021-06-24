"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientPosts = void 0;
const post_1 = require("~/serializers/post");
const createClientPosts = (posts) => {
    return posts.map((post) => post_1.serializePost({ post }));
};
exports.createClientPosts = createClientPosts;
