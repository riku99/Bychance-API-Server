import { default as axios } from "axios";
import {
  RECEIPT_VERIFICATION_ENDPOINT_FOR_IOS_PROD,
  RECEIPT_VERIFICATION_ENDPOINT_FOR_IOS_SANDBOX,
} from "~/constants";

export const postToAppleServer = async ({ receipt }: { receipt?: string }) => {
  const body = {
    "receipt-data": receipt,
    password: process.env.IAP_SECRET,
    "exclude-old-transactions": true,
  };

  try {
    let response = await axios.post(
      RECEIPT_VERIFICATION_ENDPOINT_FOR_IOS_PROD,
      body
    );

    if (response.data && response.data.status === 21007) {
      response = await axios.post(
        RECEIPT_VERIFICATION_ENDPOINT_FOR_IOS_SANDBOX,
        body
      );
    }

    return response;
  } catch (e) {}
};
