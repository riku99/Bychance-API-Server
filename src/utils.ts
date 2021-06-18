import { dayMs } from "~/constants/date";

export const filterByDayDiff = (timestamp: Date, days: number) =>
  (new Date().getTime() - new Date(timestamp).getTime()) / dayMs < days;

export const formatDate = ({ date }: { date: Date }) => {
  const y = new Date(date).getFullYear();
  const m = new Date(date).getMonth() + 1;
  const d = new Date(date).getDate();
  return `${y}/${m}/${d}`;
};

// 指定された時間内かどうか
export const confirmInTime = ({
  startHours,
  startMinutes,
  endHours,
  endMinutes,
  h,
  m,
}: {
  startHours: number;
  startMinutes: number;
  endHours: number;
  endMinutes: number;
  h: number; // 今の時間
  m: number; // 今の分数
}) => {
  if (startHours < endHours) {
    if (startHours === h) {
      return startMinutes <= m;
    }
    if (endHours === h) {
      return m <= endMinutes;
    }
    return startHours < h && h < endHours;
  } else if (startHours === endHours) {
    if (startMinutes === endMinutes) {
      return startHours === h && startMinutes === m;
    } else {
      return startHours === h && startMinutes <= m && m <= endMinutes;
    }
  } else {
    if (startHours === h) {
      return startMinutes <= m;
    }
    if (endHours === h) {
      return m <= endMinutes;
    }

    return h > startHours || h < endHours;
  }
};
