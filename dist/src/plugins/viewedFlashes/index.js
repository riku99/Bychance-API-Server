"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewedFlashesPlugin = void 0;
const viewedFlashes_1 = require("~/routes/viewedFlashes");
exports.viewedFlashesPlugin = {
    name: "app/routes/viewedFlashes",
    register: viewedFlashes_1.viewedFlashesRoute,
};
