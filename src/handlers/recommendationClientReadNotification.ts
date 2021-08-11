import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import { throwInvalidError } from "~/helpers/errors";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {};

export const handlers = {
  create,
};
