"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flashStampsPlugin = void 0;
const flashStamps_1 = require("~/routes/flashStamps");
exports.flashStampsPlugin = {
    name: "app/routes/flashStamps",
    register: flashStamps_1.flashStampsRoute,
};
