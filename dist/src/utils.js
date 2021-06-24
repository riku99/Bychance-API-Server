"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmInTime = exports.formatDate = exports.filterByDayDiff = void 0;
const date_1 = require("~/constants/date");
const filterByDayDiff = (timestamp, days) => (new Date().getTime() - new Date(timestamp).getTime()) / date_1.dayMs < days;
exports.filterByDayDiff = filterByDayDiff;
const formatDate = ({ date }) => {
    const y = new Date(date).getFullYear();
    const m = new Date(date).getMonth() + 1;
    const d = new Date(date).getDate();
    return `${y}/${m}/${d}`;
};
exports.formatDate = formatDate;
// 指定された時間内かどうか
const confirmInTime = ({ startHours, startMinutes, endHours, endMinutes, h, m, }) => {
    if (startHours < endHours) {
        if (startHours === h) {
            return startMinutes <= m;
        }
        if (endHours === h) {
            return m <= endMinutes;
        }
        return startHours < h && h < endHours;
    }
    else if (startHours === endHours) {
        if (startMinutes === endMinutes) {
            return startHours === h && startMinutes === m;
        }
        else {
            return startHours === h && startMinutes <= m && m <= endMinutes;
        }
    }
    else {
        if (startHours === h) {
            return startMinutes <= m;
        }
        if (endHours === h) {
            return m <= endMinutes;
        }
        return h > startHours || h < endHours;
    }
};
exports.confirmInTime = confirmInTime;
