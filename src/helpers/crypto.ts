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

type HandleUserLocationCrypt = {
  (lat: number, lng: number, mode: "encrypt"): {
    lat: string;
    lng: string;
  };
  (lat: string, lng: string, mode: "decrypt"): {
    lat: number;
    lng: number;
  };
};

export const handleUserLocationCrypt: HandleUserLocationCrypt = (
  lat: number | string,
  lng: number | string,
  mode: "encrypt" | "decrypt"
): any => {
  if (
    typeof lat === "number" &&
    typeof lng === "number" &&
    mode === "encrypt"
  ) {
    const encryptedLat = CryptoJS.AES.encrypt(
      String(lat),
      (process.env.USER_LOCATION_KEY as string) || "testkey"
    ).toString();
    const encryptedLng = CryptoJS.AES.encrypt(
      String(lng),
      (process.env.USER_LOCATION_KEY as string) || "testkey"
    ).toString();

    return { lat: encryptedLat, lng: encryptedLng };
  }

  if (
    typeof lat === "string" &&
    typeof lng === "string" &&
    mode === "decrypt"
  ) {
    const decryptedLat = CryptoJS.AES.decrypt(
      String(lat),
      (process.env.USER_LOCATION_KEY as string) || "testkey"
    ).toString;

    const decryptedLng = CryptoJS.AES.decrypt(
      String(lng),
      (process.env.USER_LOCATION_KEY as string) || "testkey"
    ).toString;

    return { lat: Number(decryptedLat), lng: Number(decryptedLng) };
  }
};
