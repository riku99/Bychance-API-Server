import AWS from "aws-sdk";
import sharp from "sharp";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import util from "util";

import { createRandomString } from "~/helpers/crypto";
import { URL } from "url";

sharp.cache(false);

const writeFile = util.promisify(fs.writeFile);
const deleteFile = util.promisify(fs.unlink);
const readFile = util.promisify(fs.readFile);

const getResizeNumber = (domain: string) => {
  switch (domain) {
    case "post":
      return {
        width: null,
        height: null,
      };
    case "flash":
      return {
        // width: 720,
        // height: 1280,
        width: null,
        height: null,
      };
    case "avatar":
      return {
        width: 500,
        height: 500,
      };
    case "backGroundItem":
      return {
        // width: 768,
        // height: 1024,
        width: null,
        height: null,
      };
    case "recommendationClient":
      return {
        width: 500,
        height: 500,
      };
    case "recommendation":
      return {
        width: 960, // 3:2
        height: 640,
      };
    default:
      return {
        width: 500,
        height: 500,
      };
  }
};

const resizeImage = async ({
  data,
  domain,
  metaData,
  resizeNumber,
}: {
  data: sharp.Sharp;
  domain: string;
  metaData: {
    width?: number;
    height?: number;
  };
  resizeNumber: {
    width: number | null;
    height: number | null;
  };
}) => {
  if (domain === ("post" || "flash" || "backGroundItem")) {
    if (metaData.width && metaData.height) {
      if (
        metaData.width > metaData.height ||
        metaData.width === metaData.height
      ) {
        // 元が横長か正方形の場合比率を変えずにwidthを1080にリサイズ
        data.resize(1080);
      } else {
        // 縦長の場合はheightを基準
        data.resize(null, 1080);
      }
    } else {
      // メタデータのwidthをheightがない場合はとりあえずwidthを1080にリサイズ
      data.resize(1080);
    }
  } else {
    if (resizeNumber.width && resizeNumber.height) {
      data.resize(resizeNumber.width, resizeNumber.height);
    }
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

const convertVideo = ({
  inputFilePath,
  outputFilePath,
  width,
  height,
}: {
  inputFilePath: string;
  outputFilePath: string;
  width: number | null;
  height: number | null;
}): Promise<Buffer> => {
  return new Promise(async (resolve) => {
    try {
      const ffmpegData = ffmpeg(inputFilePath)
        .videoCodec("libx264")
        .toFormat("mp4");

      ffmpegData.save(outputFilePath).on("end", async () => {
        const data = await readFile(outputFilePath);
        resolve(data);
      });
    } catch {}
  });
};

const createThumbnail = ({
  inputFilePath,
}: {
  inputFilePath: string;
}): Promise<Buffer> => {
  const outputFileName = createRandomString().replace(/\//g, "");
  const outputFilePath = `${__dirname}/../../tmp/thumbnails/${outputFileName}.png`;

  return new Promise(async (resolve) => {
    try {
      ffmpeg(inputFilePath)
        .screenshots({
          count: 1,
          timestamps: [0.0],
          // size: width && height ? `${width}x${height}` : undefined, ここで条件分岐してサイズ指定するとうまくいかないのでsharpの方で対応
          folder: `${__dirname}/../../tmp/thumbnails`,
          filename: `${outputFileName}.png`,
        })
        .on("end", async () => {
          const data = await readFile(outputFilePath);
          const webpData = sharp(data).webp();
          const bufferData = await webpData.toBuffer();
          resolve(bufferData);
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

export type UrlData = {
  source: string;
  thumbnail?: string;
  dimensions?: { width: number; height: number };
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

  let dimensions: { width: number; height: number };

  const resizeNumber = getResizeNumber(domain);

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
    const webpData = sharp(decodedData)
      .rotate() // exifの関係でrotate()つけないと回転率が変になる時ある https://stackoverflow.com/questions/48716266/sharp-image-library-rotates-image-when-resizing
      .webp();
    const metaData = await webpData.metadata();

    await resizeImage({
      data: webpData,
      domain,
      metaData: {
        width: metaData.width,
        height: metaData.height,
      },
      resizeNumber,
    });

    const { data, info } = await webpData.toBuffer({ resolveWithObject: true });
    sourceBufferData = data;
    dimensions = { width: info.width, height: info.height };
  } else {
    const inputFileName = createRandomString().replace(/\//g, "");
    const inputFilePath = `${__dirname}/../../tmp/video/"${inputFileName}.${ext}`;
    const outputFileName = createRandomString().replace(/\//g, "");
    const outputFilePath = `${__dirname}/../../tmp/video/"${outputFileName}.mp4`;

    try {
      await writeFile(inputFilePath, decodedData);
      const result = await Promise.all([
        convertVideo({
          inputFilePath,
          outputFilePath,
          width: resizeNumber.width,
          height: resizeNumber.height,
        }),
        createThumbnail({
          inputFilePath,
        }),
      ]);
      sourceBufferData = result[0];
      thumbnailBufferData = result[1];
      ffmpeg(outputFilePath).ffprobe(0, async (err, data) => {
        if (data.streams[0].width && data.streams[0].height) {
          dimensions = {
            width: data.streams[0].width,
            height: data.streams[0].height,
          };
        }
        await deleteFile(inputFilePath);
        await deleteFile(outputFilePath);
      });
    } catch {
      await deleteFile(inputFilePath);
      await deleteFile(outputFilePath);
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
    const urls = await Promise.all([upload(params), upload(thumbnailParams)]);
    urlData = {
      source: `${process.env.CLOUD_FRONT_ORIGIN}${new URL(urls[0]).pathname}`,
      thumbnail: `${process.env.CLOUD_FRONT_ORIGIN}${
        new URL(urls[1]).pathname
      }`,
      dimensions: dimensions!,
    };
  } else {
    const url = await upload(params);
    urlData = {
      source: `${process.env.CLOUD_FRONT_ORIGIN}${new URL(url).pathname}`,
      dimensions: dimensions!,
    };
  }
  return urlData!;
};
