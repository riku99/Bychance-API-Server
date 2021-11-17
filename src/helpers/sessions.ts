import { PrismaClient, UnwrapPromise } from "@prisma/client";
import { getLoginData } from "~/models/sessions";
import { handleUserLocationCrypto } from "~/helpers/crypto";

export const formLoginData = (
  data: UnwrapPromise<NonNullable<ReturnType<typeof getLoginData>>>
) => {
  if (!data) {
    return;
  }
  const { posts, flashes, backGroundItem, ...userData } = data;
  const { lat, lng, ...restUserData } = userData;
  let decryptedLat: number | null = null;
  let decryptedLng: number | null = null;
  if (lat && lng) {
    const { lat: _lat, lng: _lng } = handleUserLocationCrypto(
      lat,
      lng,
      "decrypt"
    );

    decryptedLat = _lat;
    decryptedLng = _lng;
  }

  return {
    user: {
      ...restUserData,
      lat: decryptedLat,
      lng: decryptedLng,
    },
    posts,
    flashes,
    backGroundItem,
  };
};
