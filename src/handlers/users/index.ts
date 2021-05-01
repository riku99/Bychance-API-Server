import Hapi from "@hapi/hapi";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

type UpdateArtifacts = User;

const updateUser = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as UpdateArtifacts;
};
