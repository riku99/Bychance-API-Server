"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializePost = void 0;
const utils_1 = require("~/utils");
const serializePost = ({ post }) => {
    const date = utils_1.formatDate({ date: post.createdAt });
    const clientPost = {
        id: post.id,
        url: post.url,
        sourceType: post.sourceType,
        text: post.text,
        userId: post.userId,
        date,
    };
    return clientPost;
};
exports.serializePost = serializePost;
