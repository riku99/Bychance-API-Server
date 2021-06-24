"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto_1 = require("~/helpers/crypto");
const prisma = new client_1.PrismaClient();
const 東京駅 = { lat: 35.681375616248026, lng: 139.7671033399978 };
const ミッドタウン日比谷 = { lat: 35.673549445540964, lng: 139.75958189766783 };
const 銀座シックス = { lat: 35.66981447626656, lng: 139.76403205590788 };
const 丸ビル = { lat: 35.6811797165906, lng: 139.76381342650316 };
const 有楽町駅 = { lat: 35.67505450850852, lng: 139.76284407397068 };
const マキマ = {
    name: "マキマ",
    lineId: "makima",
    accessToken: "makima",
    ...東京駅,
};
const アキ = {
    name: "アキ",
    lineId: "aki",
    accessToken: "aki",
    ...ミッドタウン日比谷,
};
const デンジ = {
    name: "デンジ",
    lineId: crypto_1.createHash("denzi"),
    accessToken: crypto_1.createHash("denzi"),
    ...銀座シックス,
};
const パワー = {
    name: "パワー",
    lineId: "pawa-",
    accessToken: "pawa-",
    ...丸ビル,
};
const コベニ = {
    name: "コベニ",
    lineId: "koebni",
    accessToken: "kobeni",
    ...有楽町駅,
};
const users = [マキマ, アキ, デンジ, パワー, コベニ];
const runUsersSeed = async () => {
    for (const user of users) {
        const { lat, lng } = crypto_1.handleUserLocationCrypt(user.lat, user.lng, "encrypt");
        await prisma.user.create({
            data: {
                ...user,
                lat,
                lng,
            },
        });
    }
};
runUsersSeed();
