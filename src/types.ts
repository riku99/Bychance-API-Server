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
  | "showedPostModal"
>;

export type ClientRecommendation = {
  id: number;
  title: string;
  coupon: boolean;
  text: string;
  images: {
    url: string;
  }[];
  client: {
    url: string | null;
    name: string;
    image: string | null;
    instagram: string | null;
    twitter: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
  };
};
