"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionsHandler = exports.logout = exports.sessionLogin = void 0;
const axios_1 = __importDefault(require("axios"));
const client_1 = require("@prisma/client");
const crypto_1 = require("~/helpers/crypto");
const errors_1 = require("~/helpers/errors");
const clientData_1 = require("~/helpers/clientData");
const includes_1 = require("~/prisma/includes");
const prisma = new client_1.PrismaClient();
const lineLogin = async (req, h) => {
    const headers = req.headers;
    const token = headers.authorization.split(" ")[1]; // Bearer取り出し
    const body = `id_token=${token}&client_id=${process.env.ChannelId}`; // x-www-form-urlencodedに形成
    let res;
    try {
        res = await axios_1.default.post("https://api.line.me/oauth2/v2.1/verify", body, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
    }
    catch (err) {
        console.log(err);
        errors_1.throwLoginError();
        return;
    }
    const nonce = res.data.nonce;
    const existingNonce = await prisma.nonce.findUnique({
        where: { nonce },
    });
    if (!existingNonce) {
        errors_1.throwLoginError();
        return;
    }
    else {
        await prisma.nonce.delete({ where: { nonce } });
    }
    const lineId = res.data.sub;
    const hashedLineId = crypto_1.createHash(lineId); // lineIdのDBへの保存はハッシュ化
    const existingUser = await prisma.user.findFirst({
        where: { lineId: hashedLineId },
    });
    const accessToken = crypto_1.createRandomString(); // ユーザー側で保存
    const hashededAccessToken = crypto_1.createHash(accessToken); // DBに保存
    const name = res.data.name;
    const avatar = res.data.picture ? res.data.picture : null;
    const user = existingUser
        ? // userが存在する場合はそれを返す
            await prisma.user.update({
                where: {
                    id: existingUser.id,
                },
                data: {
                    accessToken: hashededAccessToken,
                },
                include: includes_1.createClientIncludes,
            })
        : // 新規の場合は新たに作成
            await prisma.user.create({
                data: {
                    lineId: hashedLineId,
                    accessToken: hashededAccessToken,
                    name,
                    avatar,
                },
                include: includes_1.createClientIncludes,
            });
    if (!user.login) {
        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                login: true,
            },
        });
    }
    const { posts, flashes, senderTalkRooms, recipientTalkRooms, talkRoomMessages, readTalkRoomMessages, viewedFlashes, ...rest } = user;
    const clientData = clientData_1.createClientData({
        user: rest,
        posts,
        flashes,
        readTalkRoomMessages,
        viewedFlashes,
        senderTalkRooms,
        recipientTalkRooms,
    });
    return { ...clientData, accessToken };
};
const sessionLogin = async (req, h) => {
    const user = req.auth.artifacts;
    if (!user.login) {
        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                login: true,
            },
        });
    }
    const data = await prisma.user.findUnique({
        where: { id: user.id },
        include: includes_1.createClientIncludes,
    });
    const { posts, flashes, senderTalkRooms, recipientTalkRooms, talkRoomMessages, readTalkRoomMessages, viewedFlashes, ...rest } = data;
    return clientData_1.createClientData({
        user: rest,
        posts,
        flashes,
        readTalkRoomMessages,
        viewedFlashes,
        senderTalkRooms,
        recipientTalkRooms,
    });
};
exports.sessionLogin = sessionLogin;
const logout = async (req, h) => {
    const user = req.auth.artifacts;
    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            login: false,
        },
    });
    return h.response().code(200);
};
exports.logout = logout;
const sampleLogin = async (req, h) => {
    const data = await prisma.user.findUnique({
        where: { id: "5b9a9b57-d497-4dd5-b257-cd5d10c2ea40" },
        include: includes_1.createClientIncludes,
    });
    await prisma.user.update({
        where: {
            id: "5b9a9b57-d497-4dd5-b257-cd5d10c2ea40",
        },
        data: {
            login: true,
        },
    });
    const { posts, flashes, senderTalkRooms, recipientTalkRooms, talkRoomMessages, readTalkRoomMessages, viewedFlashes, ...rest } = data;
    const clientData = clientData_1.createClientData({
        user: rest,
        posts,
        flashes,
        readTalkRoomMessages,
        viewedFlashes,
        senderTalkRooms,
        recipientTalkRooms,
    });
    return {
        ...clientData,
        accessToken: "denzi",
    };
};
exports.sessionsHandler = {
    lineLogin,
    sessionLogin: exports.sessionLogin,
    logout: exports.logout,
    sampleLogin,
};
