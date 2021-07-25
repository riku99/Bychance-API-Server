import { PrismaClient } from "@prisma/client";

import { recommendationClient } from "./recommendationClient";

const prisma = new PrismaClient();

export const displayedRecommendation = {
  id: 1,
  title: "お洒落なカフェでまったりしません?",
  text: "",
  coupon: false,
  display: true,
  clientId: recommendationClient.id,
};

export const expiredRecommendation = {
  id: 2,
  title: "おいしいアイスラテあります!",
  text: "",
  coupon: false,
  endTime: new Date("2020-01-01"), // 既に終了している
  display: true,
  clientId: recommendationClient.id,
};

export const notDisplayedRecommendation = {
  id: 3,
  title: "おいしいアイスラテあります!",
  text: "",
  coupon: false,
  display: false, // 非表示にしている
  clientId: recommendationClient.id,
};

const dataList = [
  displayedRecommendation,
  expiredRecommendation,
  notDisplayedRecommendation,
];

export const createRecommendation = () => {
  let promise: Promise<any>[] = [];
  dataList.forEach((data) => {
    promise.push(
      prisma.recommendation.create({
        data,
      })
    );
  });

  return Promise.all(promise);
};
