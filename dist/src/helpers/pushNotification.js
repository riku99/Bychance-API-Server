"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushNotificationToMany = exports.pushNotificationToOne = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const pushNotificationToOne = async (data) => {
    await firebase_admin_1.default.messaging().send(data);
};
exports.pushNotificationToOne = pushNotificationToOne;
const pushNotificationToMany = async (data) => {
    await firebase_admin_1.default.messaging().sendMulticast(data);
};
exports.pushNotificationToMany = pushNotificationToMany;
