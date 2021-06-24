"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceTokenPlugin = void 0;
const deviceToken_1 = require("~/routes/deviceToken");
exports.deviceTokenPlugin = {
    name: "app/routes/deviceToken",
    register: deviceToken_1.deviceTokenRoute,
};
