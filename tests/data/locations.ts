import geohash from "ngeohash";
import { geohashPrecision } from "~/constants";
import { createHash, handleUserLocationCrypto } from "~/helpers/crypto";

const shibuyaStationLat = 35.65878988107083;
const shibuyaStationLng = 139.7008226094712;
const shibuyaStationCrypto = handleUserLocationCrypto(
  shibuyaStationLat,
  shibuyaStationLng,
  "encrypt"
);
const sibuyaStationHashedGH = createHash(
  geohash.encode(shibuyaStationLat, shibuyaStationLng, geohashPrecision)
);

export const locations = {
  渋谷駅: {
    lat: shibuyaStationLat,
    lng: shibuyaStationLng,
    cryptoLat: shibuyaStationCrypto.lat,
    cryptoLng: shibuyaStationCrypto.lng,
    hashedGH: sibuyaStationHashedGH,
  },
};
