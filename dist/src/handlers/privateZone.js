"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateZoneHandler = void 0;
const client_1 = require("@prisma/client");
const distance_1 = __importDefault(require("@turf/distance"));
const helpers_1 = require("@turf/helpers");
const errors_1 = require("~/helpers/errors");
const crypto_1 = require("~/helpers/crypto");
const prisma = new client_1.PrismaClient();
const getPrivateZone = async (req, h) => {
    const user = req.auth.artifacts;
    const privateZone = await prisma.privateZone.findMany({
        where: {
            userId: user.id,
        },
        select: {
            id: true,
            address: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    const decryptProvateZone = privateZone.map((z) => {
        const decryptAddress = crypto_1.handleAddressCrypt(z.address, "decrypt");
        return {
            id: z.id,
            address: decryptAddress,
        };
    });
    return decryptProvateZone;
};
const createPrivateZone = async (req, h) => {
    const user = req.auth.artifacts;
    const payload = req.payload;
    const cryptoResult = crypto_1.handleUserLocationCrypt(payload.lat, payload.lng, "encrypt");
    const cryptoAddress = crypto_1.handleAddressCrypt(payload.address, "encrypt");
    const result = await prisma.privateZone.create({
        data: {
            userId: user.id,
            lat: cryptoResult.lat,
            lng: cryptoResult.lng,
            address: cryptoAddress,
        },
    });
    // プライベートゾーンを追加したということは、それまでプライベートゾーン内にはいなかったがこの追加によりプライベートゾーン内にいる状態に変化する可能性がある。それを検証する
    if (user.lat && user.lng && !user.inPrivateZone) {
        const decryptCurrentLatLng = crypto_1.handleUserLocationCrypt(user.lat, user.lng, "decrypt");
        const privatePoint = helpers_1.point([payload.lng, payload.lat]);
        const currentUserPoint = helpers_1.point([
            decryptCurrentLatLng.lng,
            decryptCurrentLatLng.lat,
        ]);
        const distanceResult = distance_1.default(privatePoint, currentUserPoint);
        if (distanceResult <= Number(process.env.PRIVATE_ZONE_RANGE)) {
            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    inPrivateZone: true,
                },
            });
        }
    }
    return {
        id: result.id,
        address: payload.address,
    };
};
const deletePrivateZone = async (req, h) => {
    const user = req.auth.artifacts;
    const params = req.params;
    const result = await prisma.privateZone.deleteMany({
        where: {
            id: Number(params.id),
            userId: user.id,
        },
    });
    if (!result.count) {
        return errors_1.throwInvalidError();
    }
    // プライベートゾーンを削除したということは、プライベートゾーン内にいる状態からそうでなくなる可能性がある。つまりinPrivateZoneがtrue -> falseになる可能性があるのでそれを検証
    if (user.lat && user.lng && user.inPrivateZone) {
        const currentPrivateZone = await prisma.privateZone.findMany({
            where: {
                userId: user.id,
            },
        });
        const decryptCurrentLatLng = crypto_1.handleUserLocationCrypt(user.lat, user.lng, "decrypt");
        const userCurrentPoint = helpers_1.point([
            decryptCurrentLatLng.lng,
            decryptCurrentLatLng.lat,
        ]);
        const inPrivateZone = currentPrivateZone.find((p) => {
            const decryptPrivateLatLng = crypto_1.handleUserLocationCrypt(p.lat, p.lng, "decrypt");
            const privatePoint = helpers_1.point([
                decryptPrivateLatLng.lng,
                decryptPrivateLatLng.lat,
            ]);
            const distanceResult = distance_1.default(privatePoint, userCurrentPoint);
            return distanceResult <= Number(process.env.PRIVATE_ZONE_RANGE);
        });
        if (!inPrivateZone) {
            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    inPrivateZone: false,
                },
            });
        }
    }
    return h.response().code(200);
};
exports.privateZoneHandler = {
    getPrivateZone,
    createPrivateZone,
    deletePrivateZone,
};
