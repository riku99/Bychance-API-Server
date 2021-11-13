import Hapi from "@hapi/hapi";

import { prisma } from "~/lib/prisma";
import { create4digitNumber } from "~/utils";
import { sendMail } from "~/mailer";
import { CreateUserAuthCode } from "~/routes/userAuthCode/validators";

const createUserAuthCodeAndSendEmail = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const { email } = req.payload as CreateUserAuthCode;
  const code = create4digitNumber();

  await prisma.userAuthCode.create({
    data: {
      code,
    },
  });

  sendMail({
    address: email,
    text: `認証コードは ${code} です\n有効期限は30分です。`,
  });

  return h.response().code(200);
};

export const handles = {
  createUserAuthCodeAndSendEmail,
};
