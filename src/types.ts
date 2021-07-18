import { RecommendationClient, Recommendation } from "@prisma/client";

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

export type ClientRecommendation = Pick<
  Recommendation,
  "id" | "title" | "coupon" | "text"
> & {
  name: string;
  avatar: string | null;
  images: string[];
  distance?: number;
  url: string | null;
  instagram: string | null;
  twitter: string | null;
  address: string;
  lat: number;
  lng: number;
};
