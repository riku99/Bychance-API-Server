import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import distance from "@turf/distance";
import { point } from "@turf/helpers";

import { Artifacts } from "~/auth/bearer";
import { GetnearbyUsersQuery } from "~/routes/nearbyUsers/validator";
import { handleUserLocationCrypt } from "~/helpers/crypto";
import { createAnotherUser } from "~/helpers/anotherUser";
import { postIncludes, flashIncludes } from "~/prisma/includes";
import { createClientFlashStamps } from "~/helpers/flashes";
import { ClientFlashStamp } from "~/types/clientData";

const prisma = new PrismaClient();

const getNearbyUsers = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const user = req.auth.artifacts as Artifacts;
  const query = req.query as GetnearbyUsersQuery;

  const requestUserPoint = point([query.lng, query.lat]); // 経度緯度の順で渡す

  const viewedFlashes = await prisma.viewedFlash.findMany({
    where: {
      userId: user.id,
    },
  });

  const displayedUsers = await prisma.user.findMany({
    where: {
      display: true,
      login: true,
    },
    include: {
      ...postIncludes,
      ...flashIncludes,
    },
  });

  const allDistance: number[] = [];

  const nearbyUsers = displayedUsers.filter((user) => {
    if (!user.lat || !user.lng) {
      return false;
    }

    const { lat, lng } = handleUserLocationCrypt(user.lat, user.lng, "decrypt");
    const anotherUserPoint = point([lng, lat]);
    const distanceResult = distance(requestUserPoint, anotherUserPoint, {
      units: "kilometers",
    });

    if (distanceResult < query.range) {
      allDistance.push(distanceResult);
    }

    return distanceResult < query.range;
  });

  const sortedUsers = nearbyUsers.sort((a, b) => {
    const locationA = handleUserLocationCrypt(a.lat!, a.lng!, "decrypt");
    const locationB = handleUserLocationCrypt(b.lat!, b.lng!, "decrypt");

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

  let flashStampsData: ClientFlashStamp[] = [];

  const returnData = sortedUsers.map((user) => {
    const { posts, flashes, ...userData } = user;

    const nearbuUserFlashStampsData = createClientFlashStamps(flashes);
    flashStampsData.push(...nearbuUserFlashStampsData);
    return createAnotherUser({ user: userData, posts, flashes, viewedFlashes });
  });

  return {
    usersData: returnData,
    flashStampsData,
  };
};

export const nearbyUsersHandler = {
  getNearbyUsers,
};
