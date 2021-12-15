import Hapi from "@hapi/hapi";
import { Artifacts } from "~/auth/bearer";
import { default as axios } from "axios";
import { VerifyIAPPayload } from "~/routes/iap/validators";
import {
  RECEIPT_VERIFICATION_ENDPOINT_FOR_IOS_PROD,
  RECEIPT_VERIFICATION_ENDPOINT_FOR_IOS_SANDBOX,
} from "~/constants";
import { throwInvalidError } from "~/helpers/errors";
import { prisma } from "~/lib/prisma";

const verifyIap = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const requestUser = req.auth.artifacts as Artifacts;
  const payload = req.payload as VerifyIAPPayload;

  // body情報: https://developer.apple.com/documentation/appstorereceipts/requestbody
  const body = {
    "receipt-data": payload.receipt,
    password: process.env.IAP_SECRET,
    "exclude-old-transactions": true,
  };

  let response;
  try {
    response = await axios.post(
      RECEIPT_VERIFICATION_ENDPOINT_FOR_IOS_PROD,
      body
    );

    if (response.data && response.data.status === 21007) {
      response = await axios.post(
        RECEIPT_VERIFICATION_ENDPOINT_FOR_IOS_SANDBOX,
        body
      );
    }
  } catch (e) {
    return throwInvalidError();
  }

  const result = response.data;
  // statusが0の場合は成功
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

  // そのデータが既に使用されていないかをDBで確認
  const d = await prisma.iapReceipt.findUnique({
    where: {
      transactionId: latestReceipt.transaction_id,
    },
  });

  if (d) {
    return throwInvalidError("既に購入済みです", true);
  }

  const expiresDate: number = Number(latestReceipt.expires_date_ms);
  // await prisma.iapReceipt.create({
  //   data: {
  //     userId: requestUser.id,
  //     transactionId: latestReceipt.transaction_id,
  //     expiresDate: new Date(expiresDate),
  //   },
  // });

  // 期限内であることの確認
  const now: number = Date.now();
  if (now < expiresDate) {
    return h.response().code(204);
  } else {
    return throwInvalidError("期限切れです", true);
  }
};

export const handlers = {
  verifyIap,
};
