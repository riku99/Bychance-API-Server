"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flashesHabdler = void 0;
const client_1 = require("@prisma/client");
const aws_1 = require("~/helpers/aws");
const flash_1 = require("~/serializers/flash");
const errors_1 = require("~/helpers/errors");
const flashes_1 = require("~/helpers/flashes");
const prisma = new client_1.PrismaClient();
const createFlash = async (req, h) => {
    const user = req.auth.artifacts;
    const payload = req.payload;
    const url = await aws_1.createS3ObjectPath({
        data: payload.source,
        domain: "flash",
        id: user.id,
        ext: payload.ext,
        sourceType: payload.sourceType,
    });
    if (!url) {
        return errors_1.throwInvalidError();
    }
    const flash = await prisma.flash.create({
        data: {
            source: url.source,
            sourceType: payload.sourceType,
            userId: user.id,
        },
        include: {
            viewed: true,
            stamps: true,
        },
    });
    const defaultStampsData = flashes_1.createClientFlashStampValuesData([], flash.id);
    return {
        flash: flash_1.serializeFlash({ flash }),
        stamps: defaultStampsData,
    };
};
const deleteFlash = async (req, h) => {
    const user = req.auth.artifacts;
    const params = req.params;
    await prisma.flashStamp.deleteMany({
        where: {
            flashId: Number(params.flashId),
        },
    });
    await prisma.viewedFlash.deleteMany({
        where: {
            flashId: Number(params.flashId),
        },
    });
    const result = await prisma.flash.deleteMany({
        where: {
            id: Number(params.flashId),
            userId: user.id,
        },
    });
    if (!result.count) {
        return errors_1.throwInvalidError();
    }
    return h.response().code(200);
};
exports.flashesHabdler = {
    createFlash,
    deleteFlash,
};
