import Hapi from "@hapi/hapi";
import { Artifacts } from "~/auth/bearer";
import { VerifyIAPPayload } from "~/routes/iap/validators";
import { throwInvalidError } from "~/helpers/errors";
import { prisma, dbNow } from "~/lib/prisma";
import { postToAppleServer } from "~/helpers/iap/postToAppleServer";

const verifyIap = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const requestUser = req.auth.artifacts as Artifacts;
  const payload = req.payload as VerifyIAPPayload;

  // body情報: https://developer.apple.com/documentation/appstorereceipts/requestbody
  const response = await postToAppleServer({ receipt: payload.receipt });
  if (!response) {
    return throwInvalidError();
  }

  const result = response.data;
  if (result.status !== 0) {
    console.log("status is " + result.status);
    return throwInvalidError();
  }

  if (
    !result.receipt ||
    result.receipt.bundle_id !== process.env.APP_BUNDLE_ID
  ) {
    if (!result.receipt) {
      console.log("レシートデータが存在しません");
    } else {
      console.log("BundleId is" + result.receipt.bundle_id);
    }

    return throwInvalidError();
  }

  // 日付を基準に降順で渡されるので最新のもの1つを取得 https://medium.com/@teruhisafukumoto/breaking-changes-appstore-receipt-sort-debda31d5870
  const latestReceipt = result.latest_receipt_info[0];
  if (!latestReceipt) {
    return throwInvalidError();
  }

  const expireDate: number = Number(latestReceipt.expires_date_ms);

  // 期限内であることの確認
  const now: number = Date.now();
  if (now < expireDate) {
    const subscriptionData = {
      userId: requestUser.id,
      originalTransactionId: latestReceipt.original_transaction_id,
      expireDate: new Date(expireDate),
      productId: latestReceipt.product_id,
      reciept: result.latest_receipt,
    };
    const nowJST = dbNow();
    await prisma.subscription.upsert({
      where: {
        originalTransactionId: latestReceipt.original_transaction_id,
      },
      update: {
        ...subscriptionData,
        updatedAt: nowJST,
      },
      create: {
        ...subscriptionData,
        createdAt: nowJST,
        updatedAt: nowJST,
      },
    });

    await prisma.user.update({
      where: {
        id: requestUser.id,
      },
      data: {
        accountType: "Shop",
      },
    });
    return h.response().code(204);
  } else {
    return throwInvalidError("期限切れです", true);
  }
};

const appStoreEvent = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const result = req.payload as any;
  const password = result.password;

  if (password !== process.env.IAP_SECRET) {
    return throwInvalidError();
  }

  const notificationType = result.notification_type;
  const recieptData = result.unified_receipt;
  const reciept = recieptData.latest_receipt;
  const latestReceipt = recieptData.latest_receipt_info[0];
  const originalTransactionId = latestReceipt.original_transaction_id;
  const expireDate = Number(latestReceipt.expires_date_ms);
  const productId = latestReceipt.product_id;

  console.log("notificationType is " + notificationType);

  // サブスク自動更新
  if (notificationType === "DID_RENEW") {
    console.log("✋ update");
    await prisma.subscription.update({
      where: {
        originalTransactionId,
      },
      data: {
        reciept,
        originalTransactionId,
        expireDate: new Date(expireDate),
        productId,
      },
    });
  } else if (notificationType === "DID_CHANGE_RENEWAL_STATUS") {
    // DID_CHANGE_RENEWAL_STATUSは単なる停止以外にもさまざまな時に渡されるイベント
    // そのイベントに応じたexpires_dateが渡されるのでそれに更新
    console.log("💓 expire Date update to " + expireDate);
    await prisma.subscription.update({
      where: {
        originalTransactionId,
      },
      data: {
        expireDate: new Date(expireDate),
      },
    });
  } else if (notificationType === "CANCEL") {
    // 返金
    // 返金の場合はexpireDateをこの時点にし、accountTypeもかえる
    const nowJST = dbNow();
    const subscription = await prisma.subscription.update({
      where: {
        originalTransactionId,
      },
      data: {
        expireDate: nowJST,
      },
    });

    if (!subscription) {
      return throwInvalidError();
    }

    await prisma.user.update({
      where: {
        id: subscription.userId,
      },
      data: {
        accountType: "NormalUser",
      },
    });
  }

  return h.response().code(200);
};

export const handlers = {
  verifyIap,
  appStoreEvent,
};
