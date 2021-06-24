"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.nearbyUsersHandler = void 0;
const client_1 = require("@prisma/client");
const distance_1 = __importDefault(require("@turf/distance"));
const helpers_1 = require("@turf/helpers");
const crypto_1 = require("~/helpers/crypto");
const anotherUser_1 = require("~/helpers/anotherUser");
const includes_1 = require("~/prisma/includes");
const flashes_1 = require("~/helpers/flashes");
const utils_1 = require("~/utils");
const prisma = new client_1.PrismaClient();
const getNearbyUsers = async (req, h) => {
    const user = req.auth.artifacts;
    const query = req.query;
    const requestUserPoint = helpers_1.point([query.lng, query.lat]); // 経度緯度の順で渡す
    const viewedFlashes = await prisma.viewedFlash.findMany({
        where: {
            userId: user.id,
        },
    });
    const displayedUsers = await prisma.user.findMany({
        where: {
            display: true,
            login: true,
            inPrivateZone: false,
        },
        include: {
            ...includes_1.postIncludes,
            ...includes_1.flashIncludes,
            privateTime: true,
        },
    });
    const allDistance = [];
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const nearbyUsers = displayedUsers.filter((user) => {
        if (!user.lat || !user.lng) {
            return false;
        }
        const inPrivateTime = user.privateTime.find((p) => {
            const { startHours, startMinutes, endHours, endMinutes } = p;
            return utils_1.confirmInTime({
                startHours,
                startMinutes,
                endHours,
                endMinutes,
                h: hours,
                m: minutes,
            });
        });
        if (inPrivateTime) {
            return false;
        }
        const { lat, lng } = crypto_1.handleUserLocationCrypt(user.lat, user.lng, "decrypt");
        const anotherUserPoint = helpers_1.point([lng, lat]);
        const distanceResult = distance_1.default(requestUserPoint, anotherUserPoint, {
            units: "kilometers",
        });
        if (distanceResult < query.range) {
            allDistance.push(distanceResult);
        }
        return distanceResult < query.range;
    });
    const sortedUsers = nearbyUsers.sort((a, b) => {
        const locationA = crypto_1.handleUserLocationCrypt(a.lat, a.lng, "decrypt");
        const locationB = crypto_1.handleUserLocationCrypt(b.lat, b.lng, "decrypt");
        const distanceA = distance_1.default(helpers_1.point([locationA.lng, locationA.lat]), requestUserPoint);
        const distanceB = distance_1.default(helpers_1.point([locationB.lng, locationB.lat]), requestUserPoint);
        return distanceA < distanceB ? -1 : 1;
    });
    let flashStampsData = [];
    const returnData = sortedUsers.map((user) => {
        const { posts, flashes, ...userData } = user;
        const nearbuUserFlashStampsData = flashes_1.createClientFlashStamps(flashes);
        flashStampsData.push(...nearbuUserFlashStampsData);
        return anotherUser_1.createAnotherUser({ user: userData, posts, flashes, viewedFlashes });
    });
    return {
        usersData: returnData,
        flashStampsData,
    };
};
exports.nearbyUsersHandler = {
    getNearbyUsers,
};
