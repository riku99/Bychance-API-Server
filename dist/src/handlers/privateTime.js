"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateTimeHandler = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("~/helpers/errors");
const prisma = new client_1.PrismaClient();
const getPrivateTime = async (req, h) => {
    const user = req.auth.artifacts;
    const result = await prisma.privateTime.findMany({
        where: {
            userId: user.id,
        },
        select: {
            id: true,
            startHours: true,
            startMinutes: true,
            endHours: true,
            endMinutes: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return result;
};
const createPrivateTime = async (req, h) => {
    const user = req.auth.artifacts;
    const { startHours, startMinutes, endHours, endMinutes, } = req.payload;
    const result = await prisma.privateTime.create({
        data: {
            startHours,
            startMinutes,
            endHours,
            endMinutes,
            userId: user.id,
        },
    });
    return {
        id: result.id,
        startHours: result.startHours,
        startMinutes: result.startMinutes,
        endHours: result.endHours,
        endMinutes: result.endMinutes,
    };
};
const deletePrivateTime = async (req, h) => {
    const user = req.auth.artifacts;
    const params = req.params;
    const result = await prisma.privateTime.deleteMany({
        where: {
            id: Number(params.id),
            userId: user.id,
        },
    });
    if (!result.count) {
        return errors_1.throwInvalidError();
    }
    return h.response().code(200);
};
exports.privateTimeHandler = {
    createPrivateTime,
    getPrivateTime,
    deletePrivateTime,
};
