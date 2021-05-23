import AWS from "aws-sdk";
import sharp from "sharp";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import util from "util";

import { createRandomString } from "~/helpers/crypto";
import { throwInvalidError } from "./errors";

const getResizeNumber = (domain: string) => {
  switch (domain) {
    case "post":
      return {
        width: 1080,
        height: 1350,
      };
    case "flash":
      return {
        width: 720,
        height: 1280,
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
  sourceType?: "image" | "video";
};

const s3 = createS3Client();
const upload = async (params: AWS.S3.PutObjectRequest) => {
  return await s3
    .upload(params)
    .promise()
    .then((data) => data.Location)
    .catch((err) => {
      console.log(err);
      throw new Error();
    });
};

export const createS3ObjectPath = async ({
  data,
  domain,
  id,
  ext,
  sourceType = "image",
}: CreateS3ObjPath): Promise<string | void> => {
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

  let finalExt: string;
  if (type! === "image/webp") {
    finalExt = "webp";
  } else {
    finalExt = "mp4";
  }
  const { width, height } = getResizeNumber(domain);

  const randomString = createRandomString();
  const fileName = randomString.replace(/\//g, "w"); // / を全て変換。ファイル名をランダムな文字列にすることでなるべくセキュアにする
  const key = `${id}/${domain}/${fileName}.${finalExt}`;
  const fileData = data.replace(/^data:\w+\/\w+;base64,/, ""); // 接頭語を取り出す
  const decodedData = Buffer.from(fileData, "base64");

  const paramsWithputBody = {
    Bucket: process.env.BUCKET_NAME as string,
    Key: key,
    // Body: decodedData,
    // ContentType: type!,
    ContentType: "video/mp4",
  };

  if (sourceType === "image") {
    const resizedData = await sharp(decodedData)
      .resize(width, height)
      .webp()
      .toBuffer();

    const params = {
      ...paramsWithputBody,
      Body: resizedData,
    };

    const url = await upload(params);

    return url;
  } else {
    const writeFile = util.promisify(fs.writeFile);
    const deleteFile = util.promisify(fs.unlink);
    const readFile = util.promisify(fs.readFile);
    const inputFileName = createRandomString().replace(/\//g, "");
    const outputFileName = createRandomString().replace(/\//g, "");
    const inputFilePath = `./tmp/"${inputFileName}.mov`;
    const outputFilePath = `./tmp/"${outputFileName}.${finalExt}`;

    fs.writeFile(inputFilePath, decodedData, (err) => {
      if (err) {
        // エラー処理
        console.log(err);
        fs.unlink(inputFilePath, () => {});
        fs.unlink(outputFilePath, () => {});
        throw err;
      } else {
        ffmpeg(inputFilePath)
          .size("1080x1920")
          .videoCodec("libx264")
          .toFormat("mp4")
          .save(outputFilePath)
          .on("end", () => {
            console.log("変換完了");
            fs.readFile(outputFilePath, async (err, data) => {
              fs.unlink(inputFilePath, () => {});
              //fs.unlink(outputFilePath, () => {});
              if (err) {
                throw err;
              } else {
                console.log("buffer読み取り完了");

                const params = {
                  ...paramsWithputBody,
                  Body: data,
                };

                const url = await upload(params);

                return url;
              }
            });
          });
      }
    });
  }
};
