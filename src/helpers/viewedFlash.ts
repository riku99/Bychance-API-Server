import { PrismaClient } from "@prisma/client";
import { subHours } from "date-fns";

import { flashDisplayTime } from "~/constants";

const prisma = new PrismaClient();

export const deleteExpiredViewedFlashes = () => {
  console.log("⚡️ delete expired viewedFlash");
  const before12hours = subHours(new Date(), flashDisplayTime);
  prisma.viewedFlash.deleteMany({
    where: {
      createdAt: {
        lt: before12hours,
      },
    },
  });
};
