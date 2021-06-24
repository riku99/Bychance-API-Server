"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nonce = void 0;
const nonce_1 = require("~/handlers/nonce");
const validator_1 = require("./validator");
const url_1 = require("~/constants/url");
const nonce = async (server) => {
    server.route([
        {
            method: "POST",
            path: `${url_1.baseUrl}/nonce`,
            handler: nonce_1.nonceHandler.create,
            options: {
                validate: {
                    payload: validator_1.createNonceValidator.validate,
                    failAction: validator_1.createNonceValidator.failAction,
                },
                auth: false,
            },
        },
    ]);
};
exports.nonce = nonce;
