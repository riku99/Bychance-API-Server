import Hapi from "@hapi/hapi";
import { differenceInMinutes } from "date-fns";
import { prisma, dbNow } from "~/lib/prisma";
import { create4digitNumber } from "~/utils";
import { sendMail } from "~/mailer";
import {
  CreateUserAuthCode,
  VerifyUserAuthCodeQuery,
} from "~/routes/userAuthCode/validators";
import { throwInvalidError } from "~/helpers/errors";

const createUserAuthCodeAndSendEmail = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const { email } = req.payload as CreateUserAuthCode;
  const code = create4digitNumber();

  const nowJST = dbNow();

  await prisma.userAuthCode.create({
    data: {
      code,
      createdAt: nowJST,
    },
  });

  sendMail({
    address: email,
    text: `認証コードは ${code} です。\n有効期限は30分です。`,
  });

  return h.response().code(200);
};

const verifyUserAuthCode = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const query = req.query as VerifyUserAuthCodeQuery;
  const codeData = await prisma.userAuthCode.findFirst({
    where: {
      code: Number(query.code),
    },
  });

  if (!codeData) {
    return throwInvalidError("コードが間違っています。", true);
  }

  const nowJST = dbNow();
  const minDiff = differenceInMinutes(nowJST, new Date(codeData.createdAt));

  if (minDiff > 30) {
    await prisma.userAuthCode.delete({
      where: {
        id: codeData.id,
      },
    });
    return throwInvalidError("有効期限が過ぎています。", true);
  }

  await prisma.userAuthCode.delete({
    where: {
      id: codeData.id,
    },
  });
  return h.response().code(200);
};

export const handlers = {
  createUserAuthCodeAndSendEmail,
  verifyUserAuthCode,
};
