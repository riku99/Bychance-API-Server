"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewedFlashesRoute = void 0;
const url_1 = require("~/constants/url");
const validator_1 = require("./validator");
const viewedFlashes_1 = require("~/handlers/viewedFlashes");
const viewedFlashesRoute = async (server) => {
    server.route([
        {
            method: "POST",
            path: `${url_1.baseUrl}/viewedFlashes`,
            handler: viewedFlashes_1.viewedFlashHandler.createViewedFlash,
            options: {
                validate: {
                    payload: validator_1.createViewedFlashValidator.validate.payload,
                    failAction: validator_1.createViewedFlashValidator.failAction,
                },
            },
        },
    ]);
};
exports.viewedFlashesRoute = viewedFlashesRoute;
