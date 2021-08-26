import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import distance from "@turf/distance";
import { point } from "@turf/helpers";
import geohash from "ngeohash";

import { Artifacts } from "~/auth/bearer";
import { GetNearbyUsersQuery } from "~/routes/nearbyUsers/validator";
import { handleUserLocationCrypt, createHash } from "~/helpers/crypto";
import { confirmInTime } from "~/utils";
import { geohashPrecision } from "~/constants";
import { throwInvalidError } from "~/helpers/errors";

const prisma = new PrismaClient();

const get = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const query = req.query as GetNearbyUsersQuery;

  if (!user.lat || !user.lng) {
    return throwInvalidError();
  }

  const { lat, lng } = handleUserLocationCrypt(user.lat, user.lng, "decrypt");

  const requestUserPoint = point([lng, lat]); // 経度緯度の順で渡す

  const gh = geohash.encode(lat, lng, geohashPrecision);
  const hashedGh = createHash(gh);
  const neighborsHashedGh = geohash.neighbors(gh).map((g) => createHash(g));

  const displayedUsers = await prisma.user.findMany({
    where: {
      display: true,
      login: true,
      inPrivateZone: false,
      geohash: {
        in: [hashedGh, ...neighborsHashedGh],
      },
      lat: {
        not: null,
      },
      lng: {
        not: null,
      },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      statusMessage: true,
      introduce: true,
      privateTime: true,
      lat: true,
      lng: true,
      flashes: {
        include: {
          viewed: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const filteredUsers = displayedUsers
    .map((_user) => {
      if (!_user.lat || !_user.lng) {
        return;
      }

      const inPrivateTime = _user.privateTime.find((p) => {
        const { startHours, startMinutes, endHours, endMinutes } = p;
        return confirmInTime({
          startHours,
          startMinutes,
          endHours,
          endMinutes,
          h: hours,
          m: minutes,
        });
      });

      if (inPrivateTime) {
        return;
      }

      const { lat: _lat, lng: _lng } = handleUserLocationCrypt(
        _user.lat,
        _user.lng,
        "decrypt"
      );

      const anotherUserPoint = point([_lng, _lat]);
      const distanceResult = distance(requestUserPoint, anotherUserPoint, {
        units: "kilometers",
      });

      if (distanceResult > query.range) {
        return;
      }

      const { lat, lng, privateTime, flashes, ...userData } = _user;
      // const viewerViewedFlasheIds = flashes
      //   .map((f) => f.specificUserViewed)
      //   .filter((f) => f.length)
      //   .map((f) => f[0].flashId);
      // const viewedAllFlashes = viewerViewedFlasheIds.length === flashes.length;

      return {
        ...userData,
        lat: _lat,
        lng: _lng,
        flashes,
        // flashesData: {
        //   entities: flashes,
        //   viewerViewedFlasheIds,
        //   viewedAllFlashes,
        // },
      };
    })
    .filter((a): a is Exclude<typeof a, undefined> => a !== undefined)
    .sort((a, b) => {
      const locationA = { lat: a.lat, lng: b.lng };
      const locationB = { lat: b.lat, lng: b.lng };

      const distanceA = distance(
        point([locationA.lng, locationA.lat]),
        requestUserPoint
      );
      const distanceB = distance(
        point([locationB.lng, locationB.lat]),
        requestUserPoint
      );

      return distanceA < distanceB ? -1 : 1;
    });

  return filteredUsers;
};

export const handlers = {
  get,
};
