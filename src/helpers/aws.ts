import AWS from "aws-sdk";
import sharp from "sharp";

import { createRandomString } from "~/helpers/crypto";

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
  ext?: "mov" | "mp4" | "png" | "jpeg";
};

export const createS3ObjectPath = async ({
  data,
  domain,
  id,
  ext,
}: CreateS3ObjPath): Promise<string> => {
  const retrievedExt = data
    .toString()
    .slice(data.indexOf("/") + 1, data.indexOf(";"));

  let type: string;

  // 拡張子が渡される場合、渡されない場合あるのでどちらにも対応
  switch (ext || retrievedExt) {
    case "mov":
      type = "video/quicktime";
      break;
    case "mp4":
      type = "video/mp4";
      break;
    case "png":
      type = "image/png";
      break;
    case "jpeg":
      type = "image/jpeg";
      break;
  }

  const fileName = createRandomString();
  const fileData = data.replace(/^data:\w+\/\w+;base64,/, ""); // 接頭語を取り出す
  const decodedData = Buffer.from(fileData, "base64");

  // react-native-fast-imageを使ったところ大きいデータも音速で出せるようになったのでいったんリサイズ止める
  //const resizedData = await sharp(decodedData).resize(1000).toBuffer(); // 現在全てのデータに対してリサイズしているが、条件によって変えるかも

  const s3 = createS3Client();
  const key = `${id}/${domain}/${fileName}.${ext || retrievedExt}`;

  const params = {
    Bucket: process.env.BUCKET_NAME as string,
    Key: key,
    //Body: resizedData,
    Body: decodedData,
    ContentType: type!,
    CacheControl: "max-age=30000",
  };

  const url = await s3
    .upload(params)
    .promise()
    .then((data) => data.Location)
    .catch((err) => {
      console.log(err);
      throw new Error();
    });

  // とりあえずcluud flont導入していない
  return url;
};
