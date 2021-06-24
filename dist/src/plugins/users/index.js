"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersPlugin = void 0;
const users_1 = require("~/routes/users");
exports.usersPlugin = {
    name: "app/routes/users",
    register: users_1.usersRoute,
};
