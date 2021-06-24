"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaPlugin = void 0;
const client_1 = require("@prisma/client");
// Prisma Clientをhapiのserverオブジェクトで使えるようにするためのプラグイン
// ただ、DBとのやり取りの部分はhapiと切り分けて作成するかもしれないからこのプラグインいらなくなるかも
exports.prismaPlugin = {
    name: "prisma",
    register: async (server) => {
        const prisma = new client_1.PrismaClient();
        server.app.prisma = prisma;
        server.ext({
            type: "onPostStop",
            method: async (server) => {
                server.app.prisma.$disconnect();
            },
        });
    },
};
