"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateZoneRoute = void 0;
const url_1 = require("~/constants/url");
const privateZone_1 = require("~/handlers/privateZone");
const validator_1 = require("./validator");
const privateZonePath = `${url_1.baseUrl}/privateZone`;
const privateZoneRoute = async (server) => {
    server.route([
        {
            method: "GET",
            path: privateZonePath,
            handler: privateZone_1.privateZoneHandler.getPrivateZone,
        },
        {
            method: "POST",
            path: privateZonePath,
            handler: privateZone_1.privateZoneHandler.createPrivateZone,
            options: {
                validate: {
                    payload: validator_1.privateZoneValidator.create.validator.payload,
                    failAction: validator_1.privateZoneValidator.create.failAction,
                },
            },
        },
        {
            method: "DELETE",
            path: `${privateZonePath}/{id}`,
            handler: privateZone_1.privateZoneHandler.deletePrivateZone,
            options: {
                validate: {
                    params: validator_1.privateZoneValidator.delete.validator.params,
                    failAction: validator_1.privateZoneValidator.delete.failAction,
                },
            },
        },
    ]);
};
exports.privateZoneRoute = privateZoneRoute;
