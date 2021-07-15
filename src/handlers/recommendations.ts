import Hapi from "@hapi/hapi";
import { PrismaClient } from "@prisma/client";

import { CreateRecommendatoinPayload } from "~/routes/recommendations/validator";
import { RecomendationClientArtifacts } from "~/auth/bearer";
import { createS3ObjectPath, UrlData } from "~/helpers/aws";
import { throwInvalidError } from "~/helpers/errors";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const client = req.auth.artifacts as RecomendationClientArtifacts;
  const {
    title,
    text,
    images,
    coupon,
    endTime,
  } = req.payload as CreateRecommendatoinPayload;

  const recommendation = await prisma.recommendation.create({
    data: {
      title,
      text,
      coupon,
      endTime,
      clientId: client.id,
    },
  });

  let promiseData: Promise<void | UrlData>[] = [];
  images.forEach((data) => {
    promiseData.push(
      createS3ObjectPath({
        data: data.src,
        domain: "recommendation",
        id: client.id,
        ext: data.ext,
      })
    );
  });

  const imageResult = await Promise.all(promiseData);

  const notCreatedData = imageResult.some((data) => !data);

  if (notCreatedData) {
    await prisma.recommendation.delete({
      where: {
        id: recommendation.id,
      },
    });

    return throwInvalidError();
  }

  let imagesPromise: Promise<any>[] = [];

  imageResult.forEach((data) => {
    imagesPromise.push(
      prisma.recommendationImage.create({
        data: {
          // @ts-ignore
          url: data.source,
          recommendationId: recommendation.id,
        },
      })
    );
  });

  await Promise.all(imagesPromise);

  return h.response().code(200);
};

export const recommendationHandler = {
  create,
};
