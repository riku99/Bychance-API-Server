import AWS from "aws-sdk";
import sharp from "sharp";

import { createRandomString } from "~/helpers/crypto";

const getResizeNumber = (domain: string) => {
  switch (domain) {
    case "post":
      return {
        width: 1080,
        height: 1350,
      };
    case "flash":
      return {
        width: 1080,
        height: 1920,
      };
    default:
      return {
        width: null,
        height: null,
      };
  }
};

const createS3Client = () => {
  const s3Client = new AWS.S3({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
  });

  return s3Client;
};

type CreateS3ObjPath = {
  data: string;
  domain: string;
  id: string;
  ext?: string | null;
};

export const createS3ObjectPath = async ({
  data,
  domain,
  id,
  ext,
}: CreateS3ObjPath): Promise<string> => {
  let retrievedExt: string;

  if (!ext) {
    retrievedExt = data
      .toString()
      .slice(data.indexOf("/") + 1, data.indexOf(";"));
  }

  let type: string;

  // 拡張子が渡される場合、渡されない場合あるのでどちらにも対応
  // 画像の場合は全てwebpに対応
  switch (ext || retrievedExt!) {
    case "mov":
      type = "video/quicktime";
      break;
    case "mp4":
      type = "video/mp4";
      break;
    case "png":
      type = "image/webp";
      break;
    case "jpeg":
      type = "image/webp";
      break;
    case "jpg":
      type = "image/webp";
      break;
  }

  const randomString = createRandomString();
  const fileName = randomString.replace(/\//g, ""); // / を全て取り出す
  const fileData = data.replace(/^data:\w+\/\w+;base64,/, ""); // 接頭語を取り出す
  const decodedData = Buffer.from(fileData, "base64");

  const { width, height } = getResizeNumber(domain);

  const resizedData = await sharp(decodedData)
    .resize(width, height)
    .webp()
    .toBuffer();

  const s3 = createS3Client();

  let finalExt: string;
  if (type! === "image/webp") {
    finalExt = "webp";
  } else {
    finalExt = ext || retrievedExt!;
  }

  const key = `${id}/${domain}/${fileName}.${finalExt}`;

  const params = {
    Bucket: process.env.BUCKET_NAME as string,
    Key: key,
    Body: resizedData,
    ContentType: type!,
  };

  const url = await s3
    .upload(params)
    .promise()
    .then((data) => data.Location)
    .catch((err) => {
      console.log(err);
      throw new Error();
    });

  // とりあえずcloud flont導入していない
  return url;
};
