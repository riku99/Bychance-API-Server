"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRoute = void 0;
const validator_1 = require("./validator");
const users_1 = require("~/handlers/users");
const url_1 = require("~/constants/url");
const size_1 = require("~/config/apis/size");
const changeShowReceiveMessagePath = `${url_1.baseUrl}/users/showReceiveMessage`;
const usersLocation = `${url_1.baseUrl}/users/location`;
const usersRoute = async (server) => {
    server.route([
        {
            method: "PATCH",
            path: `${url_1.baseUrl}/users`,
            handler: users_1.usersHandler.updateUser,
            options: {
                validate: {
                    ...validator_1.updateUserValidator.validate,
                    failAction: validator_1.updateUserValidator.failAction,
                },
                payload: {
                    maxBytes: size_1.maxBytes,
                },
            },
        },
        {
            method: "PATCH",
            path: `${url_1.baseUrl}/users/refresh`,
            handler: users_1.usersHandler.refreshUser,
            options: {
                validate: {
                    payload: validator_1.refreshUserValidator.validate.payload,
                    failAction: validator_1.refreshUserValidator.failAction,
                },
            },
        },
        {
            method: "PATCH",
            path: `${url_1.baseUrl}/users/location`,
            handler: users_1.usersHandler.updateLocation,
            options: {
                validate: {
                    payload: validator_1.updateLocationValidator.validate.payload,
                    failAction: validator_1.updateLocationValidator.failAction,
                },
            },
        },
        {
            method: "DELETE",
            path: usersLocation,
            handler: users_1.usersHandler.deleteLocation,
        },
        {
            method: "PATCH",
            path: `${url_1.baseUrl}/users/display`,
            handler: users_1.usersHandler.changeDisplay,
            options: {
                validate: {
                    payload: validator_1.changeUserDisplayValidator.validator.payload,
                    failAction: validator_1.changeUserDisplayValidator.failAction,
                },
            },
        },
        {
            method: "PATCH",
            path: `${url_1.baseUrl}/users/videoEditDescription`,
            handler: users_1.usersHandler.changeVideoEditDescription,
            options: {
                validate: {
                    payload: validator_1.changeVideoEditDescriptionValidator.validator.payload,
                    failAction: validator_1.changeVideoEditDescriptionValidator.failAction,
                },
            },
        },
        {
            method: "PATCH",
            path: `${url_1.baseUrl}/users/talkRoomMessageReceipt`,
            handler: users_1.usersHandler.changeTalkRoomMessageReceipt,
            options: {
                validate: {
                    payload: validator_1.changeTalkRoomMessageReceiptValidator.validator.payload,
                    failAction: validator_1.changeTalkRoomMessageReceiptValidator.failAction,
                },
            },
        },
        {
            method: "PATCH",
            path: changeShowReceiveMessagePath,
            handler: users_1.usersHandler.changeShowReceiveMessage,
            options: {
                validate: {
                    payload: validator_1.changeShowReceiveMessageValidator.validator.payload,
                    failAction: validator_1.changeShowReceiveMessageValidator.failAction,
                },
            },
        },
    ]);
};
exports.usersRoute = usersRoute;
