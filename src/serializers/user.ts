import { User } from "@prisma/client";

import { ClientUser } from "~/types/clientData";
import { handleUserLocationCrypt } from "~/helpers/crypto";

// Userはprismaにより定義されたDBに関連するデータで、ClientUserはクライアント側に返すデータ
export const serializeUser = ({ user }: { user: User }): ClientUser => {
  const { lineId, createdAt, updatedAt, accessToken, ...clientData } = user;

  console.log(user);
  console.log(clientData);

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
