import AWS from "aws-sdk";
import sharp from "sharp";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import util from "util";

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

const writeFile = util.promisify(fs.writeFile);
const deleteFile = util.promisify(fs.unlink);
const readFile = util.promisify(fs.readFile);

const createS3Client = () => {
  const s3Client = new AWS.S3({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
  });

  return s3Client;
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

const convertVideo = (
  inputFilePath: string,
  outputFilePath: string
): Promise<Buffer> => {
  return new Promise(async (resolve) => {
    ffmpeg(inputFilePath)
      .size("720x1280")
      .videoCodec("libx264")
      .toFormat("mp4")
      .save(outputFilePath)
      .on("end", async () => {
        const data = await readFile(outputFilePath);
        await deleteFile(inputFilePath);
        await deleteFile(outputFilePath);
        resolve(data);
      });
  });
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
  sourceType = "image",
}: CreateS3ObjPath): Promise<string | void> => {
  let type: string;

  switch (sourceType) {
    case "image":
      type = "image/webp";
      break;
    case "video":
      type = "video/mp4";
      break;
  }

  let ext: string;
  if (type! === "image/webp") {
    ext = "webp";
  } else {
    ext = "mp4";
  }
  const { width, height } = getResizeNumber(domain);

  const randomString = createRandomString();
  const fileName = randomString.replace(/\//g, "w"); // / を全て変換。ファイル名をランダムな文字列にすることでなるべくセキュアにする
  const key = `${id}/${domain}/${fileName}.${ext}`;
  const fileData = data.replace(/^data:\w+\/\w+;base64,/, ""); // 接頭語を取り出す
  const decodedData = Buffer.from(fileData, "base64");

  const paramsWithputBody = {
    Bucket: process.env.BUCKET_NAME as string,
    Key: key,
    ContentType: type!,
  };
  let bufferData: Buffer;

  if (sourceType === "image") {
    bufferData = await sharp(decodedData)
      .resize(width, height)
      .webp()
      .toBuffer();
  } else {
    const inputFileName = createRandomString().replace(/\//g, "");
    const outputFileName = createRandomString().replace(/\//g, "");
    const inputFilePath = `./tmp/"${inputFileName}.mov`;
    const outputFilePath = `./tmp/"${outputFileName}.${ext}`;

    try {
      await writeFile(inputFilePath, decodedData);
      bufferData = await convertVideo(inputFilePath, outputFilePath);
    } catch {
      await deleteFile(inputFilePath);
      await deleteFile(outputFilePath);
    }
  }

  const params = {
    ...paramsWithputBody,
    Body: bufferData!,
  };

  const url = await upload(params);

  return url;
};
