"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootPlugin = void 0;
const root_1 = require("~/routes/root");
exports.rootPlugin = {
    name: "app/routes/root",
    register: root_1.root,
};
