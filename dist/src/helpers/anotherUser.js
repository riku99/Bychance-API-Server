"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnotherUser = void 0;
const post_1 = require("~/serializers/post");
const flash_1 = require("~/serializers/flash");
const flashes_1 = require("~/helpers/flashes");
const crypto_1 = require("~/helpers/crypto");
const createAnotherUser = ({ user, posts, flashes, viewedFlashes, }) => {
    const { id, name, avatar, introduce, statusMessage, backGroundItem, backGroundItemType, instagram, twitter, youtube, tiktok, lat: _lat, lng: _lng, } = user;
    const serializedPosts = posts.map((post) => post_1.serializePost({ post }));
    const viewedFlashIds = viewedFlashes.map((viewedFlash) => viewedFlash.flashId);
    const alreadyViewedIds = [];
    const notExpiredFlashes = flashes.filter((flash) => {
        const include = flashes_1.filterExpiredFlash(flash.createdAt);
        if (include) {
            if (viewedFlashIds.includes(flash.id)) {
                alreadyViewedIds.push(flash.id);
            }
        }
        return include;
    });
    const lastId = notExpiredFlashes.length &&
        notExpiredFlashes[notExpiredFlashes.length - 1].id;
    const isAllAlreadyViewed = alreadyViewedIds.includes(lastId);
    const serializedFlashes = notExpiredFlashes.map((flash) => flash_1.serializeFlash({ flash }));
    const flashesData = {
        entities: serializedFlashes,
        alreadyViewed: alreadyViewedIds,
        isAllAlreadyViewed,
    };
    let decryptedLat = null;
    let decryptedLng = null;
    if (_lat && _lng) {
        const { lat, lng } = crypto_1.handleUserLocationCrypt(_lat, _lng, "decrypt");
        decryptedLat = lat;
        decryptedLng = lng;
    }
    return {
        id,
        name,
        avatar,
        introduce,
        statusMessage,
        backGroundItem,
        instagram,
        twitter,
        youtube,
        tiktok,
        backGroundItemType,
        posts: serializedPosts,
        flashes: flashesData,
        lat: decryptedLat,
        lng: decryptedLng,
    };
};
exports.createAnotherUser = createAnotherUser;
