"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nonceHandler = void 0;
const nonce_1 = require("~/models/nonce");
const create = async (req, h) => {
    const { nonce } = req.payload;
    try {
        await nonce_1.Nonce.create({ nonce });
        return h.response().code(200);
    }
    catch (err) {
        console.log(err);
    }
};
exports.nonceHandler = {
    create,
};
