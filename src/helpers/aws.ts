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
    case "avatar":
      return {
        width: 500,
        height: 500,
      };
    case "backGroundItem":
      return {
        width: 1080,
        height: 1350,
      };
    default:
      return {
        width: 500,
        height: 500,
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
  resize: { width: number; height: number }
): Promise<Buffer> => {
  const w = resize.width.toString();
  const h = resize.height.toString();
  const outputFileName = createRandomString().replace(/\//g, "");
  const outputFilePath = `./tmp/video/"${outputFileName}.mp4`;
  return new Promise(async (resolve) => {
    try {
      ffmpeg(inputFilePath)
        .size(`${w}x${h}`)
        .videoCodec("libx264")
        .toFormat("mp4")
        .save(outputFilePath)
        .on("end", async () => {
          const data = await readFile(outputFilePath);
          resolve(data);
          await deleteFile(outputFilePath);
        });
    } catch {
      await deleteFile(outputFilePath);
    }
  });
};

const createThumbnail = (inputFilePath: string): Promise<Buffer> => {
  const outputFileName = createRandomString().replace(/\//g, "");
  const outputFilePath = `./tmp/thumbnails/${outputFileName}.png`;
  return new Promise(async (resolve) => {
    try {
      ffmpeg(inputFilePath)
        .screenshots({
          count: 1,
          timestamps: [0.0],
          size: "720x1280",
          folder: "./tmp/thumbnails",
          filename: `${outputFileName}.png`,
        })
        .on("end", async () => {
          const data = await readFile(outputFilePath);
          const webpData = await sharp(data).webp().toBuffer();
          resolve(webpData);
          await deleteFile(outputFilePath);
        });
    } catch {
      await deleteFile(outputFilePath);
    }
  });
};

type CreateS3ObjPath = {
  data: string;
  domain: string;
  id: string;
  ext: string;
  sourceType?: "image" | "video";
};

type UrlData = {
  source: string;
  thumbnail?: string;
};

export const createS3ObjectPath = async ({
  data,
  domain,
  id,
  sourceType = "image",
  ext,
}: CreateS3ObjPath): Promise<UrlData | void> => {
  let contentType: string; // s3に保存する際に指定するタイプ
  let s3Ext: string; // 最終的にs3で保存する際に使う拡張子

  // contentTypeは画像ならimage/webpに、動画ならvideo/mp4に統一される
  switch (sourceType) {
    case "image":
      contentType = "image/webp";
      s3Ext = "webp";
      break;
    case "video":
      contentType = "video/mp4";
      s3Ext = "mp4";
      break;
  }

  const { width, height } = getResizeNumber(domain);

  const randomString = createRandomString();
  const fileName = randomString.replace(/\//g, "w"); // / を全て変換。ファイル名をランダムな文字列にすることでなるべくセキュアにする
  const key = `${id}/${domain}/${fileName}.${s3Ext}`; // s3内のパス
  const fileData = data.replace(/^data:\w+\/\w+;base64,/, ""); // 接頭語を取り出す
  const decodedData = Buffer.from(fileData, "base64");

  const paramsWithputBody = {
    Bucket: process.env.BUCKET_NAME as string,
    Key: key,
    ContentType: contentType!,
  };

  let sourceBufferData: Buffer;
  let thumbnailBufferData: Buffer | undefined;

  if (sourceType === "image") {
    sourceBufferData = await sharp(decodedData)
      .rotate() // exifの関係でrotate()つけないと回転率が変になる時ある https://stackoverflow.com/questions/48716266/sharp-image-library-rotates-image-when-resizing
      .resize(width, height)
      .webp()
      .toBuffer();
  } else {
    const inputFileName = createRandomString().replace(/\//g, "");
    const inputFilePath = `./tmp/video/"${inputFileName}.${ext}`;

    try {
      await writeFile(inputFilePath, decodedData);
      const result = await Promise.all([
        convertVideo(inputFilePath, { width, height }),
        createThumbnail(inputFilePath),
      ]);
      sourceBufferData = result[0];
      thumbnailBufferData = result[1];
      await deleteFile(inputFilePath);
    } catch {
      await deleteFile(inputFilePath);
    }
  }

  const params = {
    ...paramsWithputBody,
    Body: sourceBufferData!,
  };

  let thumbnailParams: AWS.S3.PutObjectRequest | undefined;
  if (thumbnailBufferData) {
    thumbnailParams = {
      Bucket: process.env.BUCKET_NAME as string,
      Key: `${id}/${domain}/${fileName}_thumbnail.webp`,
      ContentType: "image/webp",
      Body: thumbnailBufferData,
    };
  }

  let urlData: UrlData;

  if (thumbnailParams) {
    const result = await Promise.all([upload(params), upload(thumbnailParams)]);
    urlData = {
      source: result[0],
      thumbnail: result[1],
    };
  } else {
    const url = await upload(params);
    urlData = {
      source: url,
    };
  }

  return urlData!;
};
