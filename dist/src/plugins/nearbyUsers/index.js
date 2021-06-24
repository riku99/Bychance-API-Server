"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nearbyUsersPlugin = void 0;
const nearbyUsers_1 = require("~/routes/nearbyUsers");
exports.nearbyUsersPlugin = {
    name: "app/routes/nearbyUsers",
    register: nearbyUsers_1.nearbyUsersRoute,
};
