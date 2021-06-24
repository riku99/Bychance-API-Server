"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersHandler = void 0;
const client_1 = require("@prisma/client");
const distance_1 = __importDefault(require("@turf/distance"));
const helpers_1 = require("@turf/helpers");
const user_1 = require("~/serializers/user");
const aws_1 = require("~/helpers/aws");
const errors_1 = require("~/helpers/errors");
const crypto_1 = require("~/helpers/crypto");
const anotherUser_1 = require("~/helpers/anotherUser");
const includes_1 = require("~/prisma/includes");
const flashes_1 = require("~/helpers/flashes");
const posts_1 = require("~/helpers/posts");
const prisma = new client_1.PrismaClient();
const updateUser = async (req, h) => {
    const user = req.auth.artifacts;
    const { deleteAvatar, deleteBackGroundItem, avatarExt, backGroundItemExt, ...userData } = req.payload;
    let newAvatar;
    let newBackGroundItem;
    let newBackGroundItemType;
    if (userData.avatar && avatarExt && !deleteAvatar) {
        const result = await aws_1.createS3ObjectPath({
            data: userData.avatar,
            domain: "avatar",
            id: user.id,
            ext: avatarExt,
        });
        newAvatar = result ? result.source : user.avatar;
    }
    else {
        if (deleteAvatar) {
            newAvatar = null;
        }
        else {
            newAvatar = user.avatar;
        }
    }
    // backGroundItemが存在するということは更新することを表す。もし存在しない場合は更新しない。
    if (userData.backGroundItem && backGroundItemExt && !deleteBackGroundItem) {
        const result = await aws_1.createS3ObjectPath({
            data: userData.backGroundItem,
            domain: "backGroundItem",
            id: user.id,
            sourceType: userData.backGroundItemType,
            ext: backGroundItemExt,
        });
        if (!result) {
            throw new Error();
        }
        newBackGroundItem = result.source;
        newBackGroundItemType = userData.backGroundItemType
            ? userData.backGroundItemType
            : null;
    }
    else {
        // backGroundItemが存在しない場合は「削除する」と「変更なし」の2種類がある。この判断はdeleteBackGroundItemで行う
        if (deleteBackGroundItem) {
            // 削除の場合nullを代入
            newBackGroundItem = null;
            newBackGroundItemType = null;
        }
        else {
            // 変更なしの場合現在のデータを指定
            newBackGroundItem = user.backGroundItem;
            newBackGroundItemType = user.backGroundItemType;
        }
    }
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            ...user,
            ...userData,
            avatar: newAvatar,
            backGroundItem: newBackGroundItem,
            backGroundItemType: newBackGroundItemType,
        },
    });
    return user_1.serializeUser({ user: updatedUser });
};
const refreshUser = async (req, h) => {
    const user = req.auth.artifacts;
    const payload = req.payload;
    const isMyData = user.id === payload.userId;
    const refreshData = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
            ...includes_1.postIncludes,
            ...includes_1.flashIncludes,
        },
    });
    if (!refreshData) {
        return errors_1.throwInvalidError("ユーザーが存在しません");
    }
    if (isMyData) {
        const { posts: _posts, flashes: _flashes, ...restUserData } = refreshData;
        const user = user_1.serializeUser({ user: restUserData });
        const posts = posts_1.createClientPosts(_posts);
        const flashes = flashes_1.createClientFlashes(_flashes);
        const flashStamps = flashes_1.createClientFlashStamps(_flashes);
        return {
            isMyData,
            user,
            posts,
            flashes,
            flashStamps,
        };
    }
    else {
        const viewedFlashes = await prisma.viewedFlash.findMany({
            where: {
                userId: user.id,
            },
        });
        const { posts, flashes, ...userData } = refreshData;
        const flashStamps = flashes_1.createClientFlashStamps(flashes);
        const data = anotherUser_1.createAnotherUser({
            user: userData,
            posts,
            flashes,
            viewedFlashes,
        });
        return {
            isMyData,
            data: {
                user: data,
                flashStamps,
            },
        };
    }
};
const updateLocation = async (req, h) => {
    const user = req.auth.artifacts;
    const payload = req.payload;
    const cryptedLocation = crypto_1.handleUserLocationCrypt(payload.lat, payload.lng, "encrypt");
    const currentPrivateZone = await prisma.privateZone.findMany({
        where: {
            userId: user.id,
        },
    });
    const newPoint = helpers_1.point([payload.lng, payload.lat]);
    const inPrivateZone = currentPrivateZone.find((p) => {
        const decryptPrivateLatLng = crypto_1.handleUserLocationCrypt(p.lat, p.lng, "decrypt");
        const privatePoint = helpers_1.point([
            decryptPrivateLatLng.lng,
            decryptPrivateLatLng.lat,
        ]);
        const distanceResult = distance_1.default(privatePoint, newPoint);
        return distanceResult <= Number(process.env.PRIVATE_ZONE_RANGE);
    });
    await prisma.user.update({
        where: { id: user.id },
        data: {
            ...cryptedLocation,
            inPrivateZone: !!inPrivateZone,
        },
    });
    return h.response().code(200);
};
const deleteLocation = async (req, h) => {
    const user = req.auth.artifacts;
    try {
        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                lat: null,
                lng: null,
                inPrivateZone: false,
            },
        });
    }
    catch {
        return errors_1.throwInvalidError("削除に失敗しました");
    }
    return h.response().code(200);
};
const changeDisplay = async (req, h) => {
    const user = req.auth.artifacts;
    const payload = req.payload;
    await prisma.user.update({
        where: { id: user.id },
        data: {
            display: payload.display,
        },
    });
    return h.response().code(200);
};
const changeVideoEditDescription = async (req, h) => {
    const user = req.auth.artifacts;
    const payload = req.payload;
    try {
        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                videoEditDescription: payload.videoEditDescription,
            },
        });
    }
    catch { }
    return h.response().code(200);
};
const changeTalkRoomMessageReceipt = async (req, h) => {
    const user = req.auth.artifacts;
    const payload = req.payload;
    try {
        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                talkRoomMessageReceipt: payload.receipt,
            },
        });
    }
    catch { }
    return h.response().code(200);
};
const changeShowReceiveMessage = async (req, h) => {
    const user = req.auth.artifacts;
    const payload = req.payload;
    try {
        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                showReceiveMessage: payload.showReceiveMessage,
            },
        });
    }
    catch {
        return errors_1.throwInvalidError("変更に失敗しました");
    }
    return h.response().code(200);
};
exports.usersHandler = {
    updateUser,
    refreshUser,
    updateLocation,
    changeDisplay,
    changeVideoEditDescription,
    changeTalkRoomMessageReceipt,
    changeShowReceiveMessage,
    deleteLocation,
};
