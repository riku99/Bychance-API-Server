"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nonce = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const create = async ({ nonce }) => {
    const result = await prisma.nonce.create({
        data: {
            nonce,
        },
    });
    return result;
};
const findFirst = async ({ nonce }) => {
    const result = await prisma.nonce.findFirst({
        where: { nonce },
    });
    return result;
};
exports.Nonce = {
    create,
    findFirst,
};
