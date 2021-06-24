"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceTokenRoute = void 0;
const url_1 = require("~/constants/url");
const validator_1 = require("./validator");
const deviceToken_1 = require("~/handlers/deviceToken");
const deviceTokenRoute = (server) => {
    server.route([
        {
            method: "POST",
            path: `${url_1.baseUrl}/deviceToken`,
            handler: deviceToken_1.deviceTokenHandler.createDeviceToken,
            options: {
                validate: {
                    payload: validator_1.createDeviceTokenValidator.validate.payload,
                    failAction: validator_1.createDeviceTokenValidator.failAction,
                },
            },
        },
    ]);
};
exports.deviceTokenRoute = deviceTokenRoute;
