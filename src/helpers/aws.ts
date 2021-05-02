import AWS from "aws-sdk";
import { da } from "date-fns/locale";

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

  const s3 = createS3Client();
  const key = `${domain}/${id}/${fileName}.${ext}`;

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

  // とりあえずcluud flont導入していない
  return url;
};
