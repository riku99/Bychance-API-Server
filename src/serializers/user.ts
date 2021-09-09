import { User } from "@prisma/client";

import { handleUserLocationCrypt } from "~/helpers/crypto";

// あとで消す
// Userはprismaにより定義されたDBに関連するデータで、ClientUserはクライアント側に返すデータ
export const serializeUser = ({ user }: { user: User }) => {
  const {
    lineId,
    createdAt,
    updatedAt,
    accessToken,
    inPrivateZone,
    login,
    ...clientData
  } = user;

  let decryptedLat: number | null = null;
  let decryptedLng: number | null = null;

  if (clientData.lat && clientData.lng) {
    const { lat, lng } = handleUserLocationCrypt(
      clientData.lat,
      clientData.lng,
      "decrypt"
    );

    decryptedLat = lat;
    decryptedLng = lng;
  }

  return {
    ...clientData,
    lat: decryptedLat ? decryptedLat : null,
    lng: decryptedLng ? decryptedLng : null,
  };
};
