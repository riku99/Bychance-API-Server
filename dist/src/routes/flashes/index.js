"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flashesRoute = void 0;
const url_1 = require("~/constants/url");
const validator_1 = require("./validator");
const flashes_1 = require("~/handlers/flashes");
const size_1 = require("~/config/apis/size");
const flashesRoute = async (server) => {
    server.route([
        {
            method: "POST",
            path: `${url_1.baseUrl}/flashes`,
            handler: flashes_1.flashesHabdler.createFlash,
            options: {
                validate: {
                    payload: validator_1.createFlashValidator.validate.payload,
                    failAction: validator_1.createFlashValidator.failAction,
                },
                payload: {
                    maxBytes: size_1.maxBytes,
                },
            },
        },
        {
            method: "DELETE",
            path: `${url_1.baseUrl}/flashes/{flashId}`,
            handler: flashes_1.flashesHabdler.deleteFlash,
            options: {
                validate: {
                    params: validator_1.deleteFlashValidator.validate.params,
                    failAction: validator_1.deleteFlashValidator.failAction,
                },
            },
        },
    ]);
};
exports.flashesRoute = flashesRoute;
