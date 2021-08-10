import { PrismaClient, RecommendationClientNotification } from "@prisma/client";

const prisma = new PrismaClient();

const notification1 = {
  id: 1,
  title: "投稿方法が変更されました",
  text: "",
  createdAt: new Date(),
};

const notification2 = {
  id: 2,
  title: "メンテナンスのお知らせ",
  text: "",
  createdAt: new Date("2021/01/01"),
};

const notification3 = {
  id: 3,
  title: "追加機能のお知らせ",
  text: "",
  createdAt: new Date("2021/07/01"),
};

const dataList = [notification1, notification2, notification3];

export const createRecommendationClientNotifications = async () => {
  let promise: Promise<RecommendationClientNotification>[] = [];
  dataList.forEach((data) => {
    promise.push(
      prisma.recommendationClientNotification.create({
        data,
      })
    );
  });

  const result = await Promise.all(promise);

  return result;
};
