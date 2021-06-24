"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flashStampsHandler = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createFlashStamp = async (req, h) => {
    const user = req.auth.artifacts;
    const payload = req.payload;
    try {
        await prisma.flashStamp.create({
            data: {
                userId: user.id,
                flashId: payload.flashId,
                value: payload.value,
            },
        });
    }
    catch {
        // return throwInvalidError();
    }
    return {
        userId: user.id,
        flashId: payload.flashId,
        value: payload.value,
    };
};
exports.flashStampsHandler = {
    createFlashStamp,
};
