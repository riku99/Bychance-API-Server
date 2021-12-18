import { PrismaClient } from "@prisma/client";
import { addHours } from "date-fns";

// 日本時間で現在
export const dbNow = (): Date => addHours(new Date(), 9);

const isPrimitive = (val: any) => Object(val) !== val;

// Subtract 9 hours from all the Date objects recursively
function subtract9Hours(obj: Record<string, unknown>) {
  if (!obj) return;

  for (const key of Object.keys(obj)) {
    const val = obj[key];

    if (val instanceof Date) {
      obj[key] = addHours(new Date(), 9);
    } else if (!isPrimitive(val)) {
      subtract9Hours(val as any);
    }
  }
}

function prismaTimeMod<T>(value: T): T {
  if (value instanceof Date) {
    return addHours(new Date(), 9) as any;
  }

  if (isPrimitive(value)) {
    return value;
  }

  subtract9Hours(value as any);

  return value;
}

// https://zenn.dev/kanasugi/articles/368d0b39c94daf
// https://github.com/prisma/prisma/discussions/4399
export const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  const result = await next(params);

  return prismaTimeMod(result);
});
