import { prisma } from "~/lib/prisma";
import { throwInvalidError } from "~/helpers/errors";

export const verifyAuthCode = async ({
  clientId,
  code,
}: {
  clientId: string;
  code: number;
}) => {
  const authCode = await prisma.clientAuthCode.findUnique({
    where: {
      clientId,
    },
  });

  if (!authCode) {
    return throwInvalidError();
  }

  if (authCode.code !== code) {
    return throwInvalidError("認証コードが間違っています");
  }

  await prisma.clientAuthCode.delete({
    where: {
      clientId,
    },
  });
};
