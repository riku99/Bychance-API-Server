import Hapi from "@hapi/hapi";
import { PrismaClient, RecommendationClient } from "@prisma/client";

import {
  CreateRecommendatoinPayload,
  GetRecommendationsForClientQuery,
  HideRecommendationParams,
} from "~/routes/recommendations/validator";
import { RecommendationClientArtifacts } from "~/auth/bearer";
import { createS3ObjectPath, UrlData } from "~/helpers/aws";
import { throwInvalidError } from "~/helpers/errors";
import { ClientRecommendation } from "~/types";

const prisma = new PrismaClient();

const create = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const client = req.auth.artifacts as RecommendationClientArtifacts;
  const {
    title,
    text,
    images,
    coupon,
    endTime,
  } = req.payload as CreateRecommendatoinPayload;

  let s3PromiseData: Promise<void | UrlData>[] = [];
  images.forEach((data) => {
    s3PromiseData.push(
      createS3ObjectPath({
        data: data.src,
        domain: "recommendation",
        id: client.id,
        ext: data.ext,
      })
    );
  });

  const imageResult = await Promise.all(s3PromiseData);

  const notCreatedData = imageResult.some((data) => !data); // s3オブジェクトの作成中にエラーがあったら配列にundefinedが入るのでundefinedが存在するかどうか確認

  // 画像データの作成に失敗している場合はこの時点で終了
  if (notCreatedData) {
    return throwInvalidError();
  }

  const recommendation = await prisma.recommendation.create({
    data: {
      title,
      text,
      coupon,
      endTime,
      clientId: client.id,
    },
  });

  let createImagesPromise: Promise<any>[] = [];

  imageResult.forEach((data) => {
    createImagesPromise.push(
      prisma.recommendationImage.create({
        data: {
          // @ts-ignore
          url: data.source,
          recommendationId: recommendation.id,
        },
      })
    );
  });

  await Promise.all(createImagesPromise);

  return h.response().code(200);
};

const getForClient = async (
  req: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<ClientRecommendation[]> => {
  const client = req.auth.artifacts as RecommendationClientArtifacts;
  const { type } = req.query as GetRecommendationsForClientQuery;

  const recommendations = await prisma.recommendation.findMany({
    where:
      type === "now"
        ? {
            clientId: client.id,
            display: true,
            OR: [
              {
                endTime: {
                  gt: new Date(),
                },
              },
              {
                endTime: null,
              },
            ],
          }
        : {
            clientId: client.id,
            OR: [
              {
                display: true,
                endTime: {
                  lt: new Date(),
                },
              },
              {
                display: false,
              },
            ],
          },
    select: {
      id: true,
      title: true,
      coupon: true,
      text: true,
      images: {
        select: {
          url: true,
        },
      },
      client: {
        select: {
          name: true,
          image: true,
          url: true,
          instagram: true,
          twitter: true,
          address: true,
          lat: true,
          lng: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return recommendations;
};

const hide = async (req: Hapi.Request, h: Hapi.ResponseToolkit) => {
  const client = req.auth.artifacts as RecommendationClientArtifacts;
  const params = req.params as HideRecommendationParams;

  const result = await prisma.recommendation.updateMany({
    where: {
      id: Number(params.id),
      clientId: client.id,
    },
    data: {
      display: false,
    },
  });

  if (!result.count) {
    return throwInvalidError();
  }

  return h.response().code(200);
};

export const recommendationHandler = {
  create,
  getForClient,
  hide,
};
