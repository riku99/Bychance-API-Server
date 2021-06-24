"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nearbyUsersRoute = void 0;
const url_1 = require("~/constants/url");
const validator_1 = require("./validator");
const nearbyUsers_1 = require("~/handlers/nearbyUsers");
const nearbyUsersRoute = async (server) => {
    server.route([
        {
            method: "GET",
            path: `${url_1.baseUrl}/nearbyUsers`,
            handler: nearbyUsers_1.nearbyUsersHandler.getNearbyUsers,
            options: {
                validate: {
                    query: validator_1.getNearbyUsersValidator.validate.query,
                    failAction: validator_1.getNearbyUsersValidator.failAction,
                },
            },
        },
    ]);
};
exports.nearbyUsersRoute = nearbyUsersRoute;
