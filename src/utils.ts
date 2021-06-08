import { dayMs } from "~/constants/date";

export const filterByDayDiff = (timestamp: Date, days: number) =>
  (new Date().getTime() - new Date(timestamp).getTime()) / dayMs < days;

export const formatDate = ({ date }: { date: Date }) => {
  const y = new Date(date).getFullYear();
  const m = new Date(date).getMonth() + 1;
  const d = new Date(date).getDate();
  return `${y}/${m}/${d}`;
};
