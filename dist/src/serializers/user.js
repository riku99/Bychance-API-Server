"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeUser = void 0;
const crypto_1 = require("~/helpers/crypto");
// Userはprismaにより定義されたDBに関連するデータで、ClientUserはクライアント側に返すデータ
const serializeUser = ({ user }) => {
    const { lineId, createdAt, updatedAt, accessToken, inPrivateZone, login, ...clientData } = user;
    let decryptedLat = null;
    let decryptedLng = null;
    if (clientData.lat && clientData.lng) {
        const { lat, lng } = crypto_1.handleUserLocationCrypt(clientData.lat, clientData.lng, "decrypt");
        decryptedLat = lat;
        decryptedLng = lng;
    }
    return {
        ...clientData,
        lat: decryptedLat ? decryptedLat : null,
        lng: decryptedLng ? decryptedLng : null,
    };
};
exports.serializeUser = serializeUser;
