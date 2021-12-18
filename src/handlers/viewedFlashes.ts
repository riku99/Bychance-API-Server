import Hapi from "@hapi/hapi";
import { dbNow, prisma } from "~/lib/prisma";
import { Artifacts } from "~/auth/bearer";
import { CreateViewedFlashPayload } from "~/routes/viewedFlashes/validator";

const createViewedFlash = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const user = req.auth.artifacts as Artifacts;
  const payload = req.payload as CreateViewedFlashPayload;

  const existing = await prisma.viewedFlash.findUnique({
    where: {
      userId_flashId_unique: {
        userId: user.id,
        flashId: payload.flashId,
      },
    },
  });

  if (existing) {
    return h.response().code(200);
  }

  const nowJST = dbNow();

  // viewedFlashを作る時のFlashがもう削除されている場合がある。prismaは失敗するとエラーを出すので、これにより500エラーがクライアントに返る。このエラーを解決したい。
  // 作成する前にFlashの存在を確かめるのでも解決するが、毎回やるのもあれなのでtry構文で囲ってエラー処理する。
  // 作成失敗しても特に問題はないし、エラー処理も今のところ特にする必要もないのでただtryの中に入れた形になっている
  try {
    await prisma.viewedFlash.create({
      data: {
        flashId: payload.flashId,
        userId: user.id,
        createdAt: nowJST,
      },
    });
  } catch {}

  return h.response().code(200);
};

export const viewedFlashHandler = {
  createViewedFlash,
};
