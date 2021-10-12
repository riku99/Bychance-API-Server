import { PrismaClient } from "@prisma/client";

// https://zenn.dev/kanasugi/articles/368d0b39c94daf
// https://github.com/prisma/prisma/discussions/4399
export const prisma = new PrismaClient();
