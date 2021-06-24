"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateZonePlugin = void 0;
const privateZone_1 = require("~/routes/privateZone");
exports.privateZonePlugin = {
    name: "app/route/privateZone",
    register: privateZone_1.privateZoneRoute,
};
