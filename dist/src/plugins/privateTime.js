"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateTimePlugin = void 0;
const privateTime_1 = require("~/routes/privateTime");
exports.privateTimePlugin = {
    name: "app/routes/privateTime",
    register: privateTime_1.privateTimeRoute,
};
