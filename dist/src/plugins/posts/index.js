"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsPlugin = void 0;
const posts_1 = require("~/routes/posts");
exports.postsPlugin = {
    name: "app/routes/posts",
    register: posts_1.postsRoute,
};
