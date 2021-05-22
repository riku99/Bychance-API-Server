import AWS from "aws-sdk";
import sharp from "sharp";

import { createRandomString } from "~/helpers/crypto";

const getResizeNumber = (domain: string, sourceType: "image" | "video") => {
  switch (domain) {
    case "post":
      return {
        width: 1080,
        height: 1350,
      };
    case "flash":
      if (sourceType === "image") {
        return {
          width: 720,
          height: 1280,
        };
      } else {
        return {
          width: 1080,
          height: 1920,
        };
      }
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
  sourceType?: "image" | "video";
};

export const createS3ObjectPath = async ({
  data,
  domain,
  id,
  ext,
  sourceType = "image",
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
  const fileName = randomString.replace(/\//g, "w"); // / を全て変換。ファイル名をランダムな文字列にすることでなるべくセキュアにする
  const fileData = data.replace(/^data:\w+\/\w+;base64,/, ""); // 接頭語を取り出す
  const decodedData = Buffer.from(fileData, "base64");

  console.log("デコードパス");

  const { width, height } = getResizeNumber(domain, sourceType);

  let resizedData: Buffer;
  if (sourceType === "image") {
    resizedData = await sharp(decodedData)
      .resize(width, height)
      .webp()
      .toBuffer();
  } else {
    //resizedData = await sharp(decodedData).resize(width, height).toBuffer();
  }

  console.log("リサイズパス");

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
    Body: decodedData,
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
