"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateTimeRoute = void 0;
const url_1 = require("~/constants/url");
const validator_1 = require("./validator");
const privateTime_1 = require("~/handlers/privateTime");
const privateTimePath = `${url_1.baseUrl}/privateTime`;
const privateTimeRoute = async (server) => {
    server.route([
        {
            method: "POST",
            path: privateTimePath,
            handler: privateTime_1.privateTimeHandler.createPrivateTime,
            options: {
                validate: {
                    payload: validator_1.privateTimeValidator.create.validator.payload,
                    failAction: validator_1.privateTimeValidator.create.failAction,
                },
            },
        },
        {
            method: "GET",
            path: privateTimePath,
            handler: privateTime_1.privateTimeHandler.getPrivateTime,
        },
        {
            method: "DELETE",
            path: `${privateTimePath}/{id}`,
            handler: privateTime_1.privateTimeHandler.deletePrivateTime,
            options: {
                validate: {
                    params: validator_1.privateTimeValidator.delete.validator.params,
                    failAction: validator_1.privateTimeValidator.delete.failAction,
                },
            },
        },
    ]);
};
exports.privateTimeRoute = privateTimeRoute;
