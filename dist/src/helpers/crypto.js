"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAddressCrypt = exports.handleUserLocationCrypt = exports.createRandomString = exports.createHash = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const sha256_1 = __importDefault(require("crypto-js/sha256"));
const uuid_1 = require("uuid");
const createHash = (data) => {
    const result = sha256_1.default(process.env.hashNonce + data).toString(crypto_js_1.default.enc.Base64);
    return result;
};
exports.createHash = createHash;
const createRandomString = () => {
    const now = new Date().getTime().toString();
    const random = Math.floor(Math.random() * 10000);
    const uuid = uuid_1.v4();
    const result = sha256_1.default(now + random + uuid).toString(crypto_js_1.default.enc.Base64);
    return result;
};
exports.createRandomString = createRandomString;
// lat, lngの暗号化
const handleUserLocationCrypt = (lat, lng, mode) => {
    if (typeof lat === "number" &&
        typeof lng === "number" &&
        mode === "encrypt") {
        const encryptedLat = crypto_js_1.default.AES.encrypt(String(lat), process.env.USER_LOCATION_KEY || "testkey").toString();
        const encryptedLng = crypto_js_1.default.AES.encrypt(String(lng), process.env.USER_LOCATION_KEY || "testkey").toString();
        return { lat: encryptedLat, lng: encryptedLng };
    }
    if (typeof lat === "string" &&
        typeof lng === "string" &&
        mode === "decrypt") {
        const decryptedLat = crypto_js_1.default.AES.decrypt(lat, process.env.USER_LOCATION_KEY || "testkey").toString(crypto_js_1.default.enc.Utf8); //CryptoJS.enc.Utf8ないと16進数で返っちゃう
        const decryptedLng = crypto_js_1.default.AES.decrypt(lng, process.env.USER_LOCATION_KEY || "testkey").toString(crypto_js_1.default.enc.Utf8);
        return { lat: Number(decryptedLat), lng: Number(decryptedLng) };
    }
};
exports.handleUserLocationCrypt = handleUserLocationCrypt;
// addressの暗号化,復号化
const handleAddressCrypt = (address, mode) => {
    if (mode === "encrypt") {
        return crypto_js_1.default.AES.encrypt(address, process.env.USER_LOCATION_KEY || "testkey").toString();
    }
    else {
        return crypto_js_1.default.AES.decrypt(address, process.env.USER_LOCATION_KEY || "testkey").toString(crypto_js_1.default.enc.Utf8);
    }
};
exports.handleAddressCrypt = handleAddressCrypt;
