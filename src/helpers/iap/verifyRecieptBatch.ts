import { subHours } from "date-fns";
import { prisma, nowJST } from "~/lib/prisma";
import { postToAppleServer } from "./postToAppleServer";

// しっかりテスト書くこと!
export const verifyRecieptBatch = async () => {
  console.log("✊ verifyRecieptBatchの実行");
  const subscriptions = await prisma.subscription.findMany({
    where: {
      expireDate: {
        lte: subHours(new Date(), 1),
        gt: subHours(new Date(), 2),
      },
    },
  });

  console.log(subscriptions.length);

  let fetchPromise: Promise<any>[] = [];

  subscriptions.forEach((s) => {
    fetchPromise.push(postToAppleServer({ receipt: s.reciept }));
  });

  const responses = await Promise.all(fetchPromise);

  let updateDataPromise: Promise<any>[] = [];

  const changeUserAccountType = async (idx: number) => {
    console.log("change account type");
    const userId = subscriptions[idx].userId;
    try {
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          accountType: "NormalUser",
        },
      });
    } catch (e) {
      // アカウント削除などで存在してなかった場合
    }
  };

  const updateData = async (response: any, idx: number) => {
    if (response) {
      const result = response.data;
      if (result.status !== 0) {
        await changeUserAccountType(idx);
      }

      const latestReceipt = result.latest_receipt_info[0];

      if (!latestReceipt) {
        await changeUserAccountType(idx);
      }

      const expireDate: number = Number(latestReceipt.expires_date_ms);
      const now: number = Date.now();

      // 期限切れ
      if (expireDate < now) {
        console.log("期限切れ");
        await changeUserAccountType(idx);
      } else {
        // なんらかの理由で最新レシートが期限切れてなかった。accountTypeを変える必要はない。
        await prisma.subscription.upsert({
          where: {
            originalTransactionId: latestReceipt.original_transaction_id,
          },
          update: {
            expireDate: new Date(expireDate),
            reciept: result.latest_receipt,
            productId: latestReceipt.product_id,
            updatedAt: nowJST,
          },
          create: {
            // 基本的にcreateされることはない
            userId: subscriptions[idx].userId,
            originalTransactionId: latestReceipt.original_transaction_id,
            expireDate: new Date(expireDate),
            productId: latestReceipt.product_id,
            reciept: result.latest_receipt,
            createdAt: nowJST,
            updatedAt: nowJST,
          },
        });
      }
    } else {
      await changeUserAccountType(idx);
    }
  };

  responses.forEach((response, idx) => {
    updateDataPromise.push(updateData(response, idx));
  });

  await Promise.all(updateDataPromise);
};
