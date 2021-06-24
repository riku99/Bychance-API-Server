"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeFlash = void 0;
const serializeFlash = ({ flash, }) => {
    const { id, source, sourceType, viewed, stamps } = flash;
    const timestamp = new Date(flash.createdAt).toString();
    const clientFlash = {
        id,
        source,
        sourceType,
        timestamp,
        viewsNumber: viewed.length,
    };
    return clientFlash;
};
exports.serializeFlash = serializeFlash;
