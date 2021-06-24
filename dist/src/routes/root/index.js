"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.root = void 0;
const root = async (server) => {
    server.route({
        method: "GET",
        path: "/",
        handler: (req, h) => {
            return "Hello World";
        },
        options: {
            auth: false,
        },
    });
};
exports.root = root;
