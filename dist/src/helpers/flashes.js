"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientFlashStamps = exports.createClientFlashStampValuesData = exports.createClientFlashes = exports.filterExpiredFlash = void 0;
const utils_1 = require("~/utils");
const flash_1 = require("~/serializers/flash");
const filterExpiredFlash = (d) => utils_1.filterByDayDiff(d, 20);
exports.filterExpiredFlash = filterExpiredFlash;
const createClientFlashes = (flashes) => {
    const notExpiredFlashes = flashes.filter((flash) => exports.filterExpiredFlash(flash.createdAt));
    return notExpiredFlashes.map((flash) => flash_1.serializeFlash({ flash }));
};
exports.createClientFlashes = createClientFlashes;
const createClientFlashStampValuesData = (stamps, flashId) => {
    let clientStampData = {
        thumbsUp: {
            number: 0,
            userIds: [],
        },
        yusyo: {
            number: 0,
            userIds: [],
        },
        yoi: {
            number: 0,
            userIds: [],
        },
        itibann: {
            number: 0,
            userIds: [],
        },
        seikai: {
            number: 0,
            userIds: [],
        },
    };
    stamps.forEach((stamp) => {
        clientStampData[stamp.value].number += 1;
        clientStampData[stamp.value].userIds.push(stamp.userId);
    });
    return {
        flashId,
        data: clientStampData,
    };
};
exports.createClientFlashStampValuesData = createClientFlashStampValuesData;
const createClientFlashStamps = (flashes) => {
    const result = flashes
        .map((f) => {
        if (exports.filterExpiredFlash(f.createdAt)) {
            return exports.createClientFlashStampValuesData(f.stamps, f.id);
        }
    })
        .filter((f) => f !== undefined);
    return result;
};
exports.createClientFlashStamps = createClientFlashStamps;
