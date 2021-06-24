"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsRoute = void 0;
const url_1 = require("~/constants/url");
const validator_1 = require("./validator");
const posts_1 = require("~/handlers/posts");
const size_1 = require("~/config/apis/size");
const postsRoute = async (server) => {
    server.route([
        {
            method: "POST",
            path: `${url_1.baseUrl}/posts`,
            handler: posts_1.postHandler.createPost,
            options: {
                validate: {
                    payload: validator_1.createPostValidator.validate.payload,
                    failAction: validator_1.createPostValidator.failAction,
                },
                payload: {
                    maxBytes: size_1.maxBytes,
                    timeout: 20000,
                },
            },
        },
        {
            method: "DELETE",
            path: `${url_1.baseUrl}/posts`,
            handler: posts_1.postHandler.deletePost,
            options: {
                validate: {
                    payload: validator_1.deletePostValidator.validate.payload,
                    failAction: validator_1.deletePostValidator.failAction,
                },
            },
        },
    ]);
};
exports.postsRoute = postsRoute;
