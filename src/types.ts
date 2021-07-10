// 名前がキモいが、クライアント側のRecommendationClientだということ
export type ClientRecommendationClient = {
  id: string;
  name: string;
  image: string | null;
  lat: number | null;
  lng: number | null;
  address: string | null;
  instagram: string | null;
  twitter: string | null;
  url: string | null;
};
