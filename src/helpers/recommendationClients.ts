import { RecommendationClient } from "@prisma/client";
import { ClientRecommendationClient } from "~/types";

const formRecommendationClient = (client: RecommendationClient) => {
  const {
    id,
    name,
    image,
    lat,
    lng,
    address,
    instagram,
    twitter,
    url,
    enablePushNotification,
    showedPostModal,
    admin,
  } = client;

  return {
    id,
    name,
    image,
    lat,
    lng,
    address,
    instagram,
    twitter,
    url,
    enablePushNotification,
    showedPostModal,
    admin,
  };
};

// formRecommendationClientはRecommendationClientのいらないプロパティを抜いたりする関数
//  createClientRecommendationClientは実際にクライアントに返すデータを作成する。
// 現在はformRecommendationClientで作るデータがそのまま返すデータなのでcreateClientRecommendationClientの中でformRecommendationClientの結果をただ返す形になっている
export const createClientRecommendationClient = (
  data: RecommendationClient
): ClientRecommendationClient => {
  return formRecommendationClient(data);
};
