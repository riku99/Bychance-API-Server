"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const start = async () => {
    const instance = await server_1.initializeServer();
    await server_1.startServer(instance);
};
start();
