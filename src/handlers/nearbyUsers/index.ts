import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";
import distance from "@turf/distance";
import { point } from "@turf/helpers";

import { Artifacts } from "~/auth/bearer";
import { GetnearbyUsersQuery } from "~/routes/nearbyUsers/validator";
import { handleUserLocationCrypt } from "~/helpers/crypto";
import { createAnotherUser } from "~/helpers/anotherUser";

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
    },
    include: {
      posts: true,
      flashes: true,
    },
  });

  const nearbyUsers = displayedUsers.filter((user) => {
    if (!user.lat || !user.lng) {
      return false;
    }

    const { lat, lng } = handleUserLocationCrypt(user.lat, user.lng, "decrypt");
    const anotherUserPoint = point([lng, lat]);
    const distanceResult = distance(requestUserPoint, anotherUserPoint, {
      units: "kilometers",
    });

    return distanceResult < query.range;
  });

  const returnData = nearbyUsers.map((user) => {
    const { posts, flashes, ...userData } = user;
    return createAnotherUser({ user: userData, posts, flashes, viewedFlashes });
  });

  return returnData;
};

export const nearbyUsersHandler = {
  getNearbyUsers,
};
