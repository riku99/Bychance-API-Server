import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import { differenceInHours } from "date-fns";

import { GetClientSignupTokenParams } from "~/routes/clientSignupToken/validator";
import { throwInvalidError } from "~/helpers/errors";

const prisma = new PrismaClient();

const getClientSignupToken = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const params = req.params as GetClientSignupTokenParams;

  const token = await prisma.clientSignupToken.findUnique({
    where: {
      token: params.signupToken,
    },
  });

  if (!token) {
    return throwInvalidError("そのトークンは存在しません");
  }

  await prisma.clientSignupToken.delete({
    where: {
      token: params.signupToken,
    },
  });

  const hoursDiff = differenceInHours(new Date(), token.createdAt);

  if (hoursDiff > 6) {
    return throwInvalidError("有効期限が切れています");
  }

  return h.response().code(200);
};

export const clientSignupTokenHandler = {
  getClientSignupToken,
};
