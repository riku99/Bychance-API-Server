import { PrismaClient } from "@prisma/client";
import Hapi from "@hapi/hapi";

declare module "@hapi/hapi" {
  interface ServerApplicationState {
    prisma: PrismaClient;
  }
}

// Prisma Clientをhapiのserverオブジェクトで使えるようにするためのプラグイン
// ただ、DBとのやり取りの部分はhapiと切り分けて作成するかもしれないからこのプラグインいらなくなるかも
export const prismaPlugin: Hapi.Plugin<null> = {
  name: "prisma",
  register: async (server) => {
    const prisma = new PrismaClient();

    server.app.prisma = prisma;

    server.ext({
      type: "onPostStop",
      method: async (server) => {
        server.app.prisma.$disconnect();
      },
    });
  },
};
