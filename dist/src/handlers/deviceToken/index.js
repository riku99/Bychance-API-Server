"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceTokenHandler = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createDeviceToken = async (req, h) => {
    const user = req.auth.artifacts;
    const payload = req.payload;
    const existingToken = await prisma.deviceToken.findUnique({
        where: {
            token: payload.token,
        },
    });
    if (!existingToken) {
        await prisma.deviceToken.create({
            data: {
                userId: user.id,
                token: payload.token,
            },
        });
    }
    return h.response().code(200);
};
exports.deviceTokenHandler = {
    createDeviceToken,
};
