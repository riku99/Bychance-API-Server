export const formatDate = ({ date }: { date: Date }) => {
  const y = new Date(date).getFullYear();
  const m = new Date(date).getMonth() + 1;
  const d = new Date(date).getDate();
  return `${y}/${m}/${d}`;
};
