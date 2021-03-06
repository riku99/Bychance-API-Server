import { PrivateTime } from "@prisma/client";

import { confirmInTime } from "~/utils";

export const getUserIsInPrivateTime = (privateTimes: PrivateTime[]) => {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return privateTimes.some((p) => {
    const { startHours, startMinutes, endHours, endMinutes } = p;
    return confirmInTime({
      startHours,
      startMinutes,
      endHours,
      endMinutes,
      h: hours,
      m: minutes,
    });
  });
};
