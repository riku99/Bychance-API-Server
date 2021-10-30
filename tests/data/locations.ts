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

const sinjukuStationLat = 35.689650249416765;
const sinjukuStationLng = 139.70050692452858;
const sinjukuStationCrypto = handleUserLocationCrypto(
  sinjukuStationLat,
  sinjukuStationLng,
  "encrypt"
);
const sinjukuStationHashedGH = createHash(
  geohash.encode(sinjukuStationLat, sinjukuStationLng, geohashPrecision)
);

export const locations = {
  渋谷駅: {
    lat: shibuyaStationLat,
    lng: shibuyaStationLng,
    cryptoLat: shibuyaStationCrypto.lat,
    cryptoLng: shibuyaStationCrypto.lng,
    hashedGH: sibuyaStationHashedGH,
  },
  新宿駅: {
    lat: sinjukuStationLat,
    lng: sinjukuStationLng,
    cryptoLat: sinjukuStationCrypto.lat,
    cryptoLng: sinjukuStationCrypto.lng,
    hashedGH: sinjukuStationHashedGH,
  },
};
