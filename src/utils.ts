import { dayMs } from "~/constants";

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
  const sDate = new Date(0);
  const eDate = new Date(0);
  const date = new Date(0);

  sDate.setHours(startHours, startMinutes);
  eDate.setHours(endHours, endMinutes);
  date.setHours(h, m);

  if (sDate.getTime() > eDate.getTime()) {
    eDate.setDate(eDate.getDate() + 1);
  }

  const t = date.getTime(),
    t2 = t + 864e5;

  return (sDate.getTime() <= t && t <= eDate.getTime()) ||
    (sDate.getTime() <= t2 && t2 <= eDate.getTime())
    ? true
    : false;
};

export const create4digitNumber = () => {
  let code: string = "";

  for (let i = 0; i < 4; i++) {
    const num = Math.floor(Math.random() * 10);
    code = code + `${num}`;
  }

  return Number(code);
};
