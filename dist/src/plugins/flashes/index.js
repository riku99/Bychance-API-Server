"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flashesPlugin = void 0;
const flashes_1 = require("~/routes/flashes");
exports.flashesPlugin = {
    name: "app/routes/flashes",
    register: flashes_1.flashesRoute,
};
