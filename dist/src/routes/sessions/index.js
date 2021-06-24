"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionsRoute = exports.logoutPath = exports.sessionLoginPath = exports.lineLoginPath = void 0;
const validator_1 = require("./validator");
const sessions_1 = require("~/handlers/sessions");
const url_1 = require("~/constants/url");
exports.lineLoginPath = `${url_1.baseUrl}/sessions/lineLogin`;
exports.sessionLoginPath = `${url_1.baseUrl}/sessions/sessionlogin`;
exports.logoutPath = `${url_1.baseUrl}/sessions/logout`;
const sessionsRoute = async (server) => {
    server.route([
        {
            method: "POST",
            path: exports.lineLoginPath,
            handler: sessions_1.sessionsHandler.lineLogin,
            options: {
                validate: {
                    // ...sessionsValidator.lineLogin.validate,
                    headers: validator_1.sessionsValidator.lineLogin.validate.headers,
                    options: {
                        allowUnknown: true, // headersで指定した以外のものは全て受け入れるための設定
                    },
                    failAction: validator_1.sessionsValidator.lineLogin.failAction,
                },
                auth: false,
            },
        },
        {
            method: "GET",
            path: exports.sessionLoginPath,
            handler: sessions_1.sessionsHandler.sessionLogin,
        },
        {
            method: "GET",
            path: exports.logoutPath,
            handler: sessions_1.sessionsHandler.logout,
        },
        {
            method: "GET",
            path: `${url_1.baseUrl}/sampleLogin`,
            handler: sessions_1.sessionsHandler.sampleLogin,
            options: {
                auth: false,
            },
        },
    ]);
};
exports.sessionsRoute = sessionsRoute;
