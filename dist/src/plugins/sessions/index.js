"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sesisonsPlugin = void 0;
const sessions_1 = require("~/routes/sessions");
exports.sesisonsPlugin = {
    name: "app/routes/sessions",
    register: sessions_1.sessionsRoute,
};
