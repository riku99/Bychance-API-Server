import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const image = "image";
const lat = 1.0;
const lng = 1.0;
const geohash = "geohash";
const address = "address";
const instagram = "instagram";
const twitter = "twitter";
const url = "url";

export const recommendationClient = {
  id: "rrr",
  uid: "uid",
  name: "ジャック",
  image,
  lat,
  lng,
  geohash,
  address,
  instagram,
  twitter,
  url,
};

export const createRecommenadtionClient = async () => {
  await prisma.recommendationClient.create({
    data: recommendationClient,
  });
};
