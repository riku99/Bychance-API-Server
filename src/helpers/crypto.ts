import CryptoJS from "crypto-js";
import sha256 from "crypto-js/sha256";
import { v4 } from "uuid";

export const createHash = (data: string) => {
  const result = sha256(process.env.HASH_NONCE + data).toString(
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

// lat, lngの暗号化
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
      lat,
      (process.env.USER_LOCATION_KEY as string) || "testkey"
    ).toString(CryptoJS.enc.Utf8); //CryptoJS.enc.Utf8ないと16進数で返っちゃう

    const decryptedLng = CryptoJS.AES.decrypt(
      lng,
      (process.env.USER_LOCATION_KEY as string) || "testkey"
    ).toString(CryptoJS.enc.Utf8);

    return { lat: Number(decryptedLat), lng: Number(decryptedLng) };
  }
};

// addressの暗号化,復号化
export const handleAddressCrypt = (
  address: string,
  mode: "decrypt" | "encrypt"
) => {
  if (mode === "encrypt") {
    return CryptoJS.AES.encrypt(
      address,
      (process.env.USER_LOCATION_KEY as string) || "testkey"
    ).toString();
  } else {
    return CryptoJS.AES.decrypt(
      address,
      (process.env.USER_LOCATION_KEY as string) || "testkey"
    ).toString(CryptoJS.enc.Utf8);
  }
};
