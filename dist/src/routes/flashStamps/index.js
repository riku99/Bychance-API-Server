"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flashStampsRoute = void 0;
const url_1 = require("~/constants/url");
const validator_1 = require("./validator");
const flashStamps_1 = require("~/handlers/flashStamps");
const createPath = `${url_1.baseUrl}/flashStamps`;
const flashStampsRoute = async (server) => {
    server.route([
        {
            method: "POST",
            path: createPath,
            handler: flashStamps_1.flashStampsHandler.createFlashStamp,
            options: {
                validate: {
                    payload: validator_1.createFlashStampValidator.validate.payload,
                    failAction: validator_1.createFlashStampValidator.failAction,
                },
            },
        },
    ]);
};
exports.flashStampsRoute = flashStampsRoute;
