import Hapi from "@hapi/hapi";
import {
  PrismaClient,
  Prisma,
  RecommendationClientReadNotification,
  User,
} from "@prisma/client";
import { throwInvalidError } from "~/helpers/errors";

import { CreatePayload } from "~/routes/recommendationClientReadNotifications/validator";
import { RecommendationClientArtifacts } from "~/auth/bearer";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const client = req.auth.artifacts as RecommendationClientArtifacts;
  const payload = req.payload as CreatePayload;

  const data = payload.ids.map((id) => ({
    clientId: client.id,
    notificationId: id,
  }));

  try {
    await prisma.recommendationClientReadNotification.createMany({
      data,
    });
  } catch (e) {
    // 仮にデータ被ってエラーになっても特にハンドリングしなくていい
  }

  return h.response().code(200);
};

export const handlers = {
  create,
};
