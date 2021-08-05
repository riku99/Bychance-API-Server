import { PrismaClient, Recommendation } from "@prisma/client";
import { string } from "joi";

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

export const createRecommendations = async () => {
  let promise: Promise<Recommendation>[] = [];
  dataList.forEach((data) => {
    promise.push(
      prisma.recommendation.create({
        data,
      })
    );
  });

  const result = await Promise.all(promise);

  let data: { [key: string]: Recommendation } = {};

  result.forEach((d) => {
    if (d.id === 1) {
      data["displayed"] = d;
    }

    if (d.id === 2) {
      data["expired"] = d;
    }

    if (d.id === 3) {
      data["notDisplayed"] = d;
    }
  });

  return data!;
};
