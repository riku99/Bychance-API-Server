import CryptoJS from "crypto-js";
import sha256 from "crypto-js/sha256";
import { v4 } from "uuid";

export const createHash = (data: string) => {
  const result = sha256(process.env.hashNonce + data).toString(
    CryptoJS.enc.Base64
  );

  return result;
};

export const createRandomString = () => {
  const now = new Date().getTime().toString();
  const random = Math.floor(Math.random() * 10000);
  const uuid = v4();
  const result = sha256(now + random + uuid).toString(CryptoJS.enc.Base64);

  return result;
};
