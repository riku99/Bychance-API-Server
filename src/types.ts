import { RecommendationClient } from "@prisma/client";

// 名前がキモいが、クライアント側のRecommendationClientだということ
export type ClientRecommendationClient = Pick<
  RecommendationClient,
  | "id"
  | "name"
  | "image"
  | "lat"
  | "lng"
  | "address"
  | "instagram"
  | "twitter"
  | "url"
  | "enablePushNotification"
>;
