"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noncePlugin = void 0;
const nonce_1 = require("~/routes/nonce");
exports.noncePlugin = {
    name: "app/routes/nonce",
    register: nonce_1.nonce,
};
