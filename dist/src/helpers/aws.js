"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createS3ObjectPath = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const util_1 = __importDefault(require("util"));
const crypto_1 = require("~/helpers/crypto");
const getResizeNumber = (domain) => {
    switch (domain) {
        case "post":
            return {
                width: 768,
                height: 1024,
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
                width: 768,
                height: 1024,
            };
        default:
            return {
                width: 500,
                height: 500,
            };
    }
};
const writeFile = util_1.default.promisify(fs_1.default.writeFile);
const deleteFile = util_1.default.promisify(fs_1.default.unlink);
const readFile = util_1.default.promisify(fs_1.default.readFile);
const createS3Client = () => {
    const s3Client = new aws_sdk_1.default.S3({
        accessKeyId: process.env.AWS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
        region: process.env.AWS_REGION,
    });
    return s3Client;
};
const s3 = createS3Client();
const upload = async (params) => {
    return await s3
        .upload(params)
        .promise()
        .then((data) => data.Location)
        .catch((err) => {
        console.log(err);
        throw new Error();
    });
};
const convertVideo = (inputFilePath, resize) => {
    const w = resize.width.toString();
    const h = resize.height.toString();
    const outputFileName = crypto_1.createRandomString().replace(/\//g, "");
    const outputFilePath = `./tmp/video/"${outputFileName}.mp4`;
    return new Promise(async (resolve) => {
        try {
            fluent_ffmpeg_1.default(inputFilePath)
                .size(`${w}x${h}`)
                .videoCodec("libx264")
                .toFormat("mp4")
                .save(outputFilePath)
                .on("end", async () => {
                const data = await readFile(outputFilePath);
                resolve(data);
                await deleteFile(outputFilePath);
            });
        }
        catch {
            await deleteFile(outputFilePath);
        }
    });
};
const createThumbnail = (inputFilePath) => {
    const outputFileName = crypto_1.createRandomString().replace(/\//g, "");
    const outputFilePath = `./tmp/thumbnails/${outputFileName}.png`;
    return new Promise(async (resolve) => {
        try {
            fluent_ffmpeg_1.default(inputFilePath)
                .screenshots({
                count: 1,
                timestamps: [0.0],
                size: "720x1280",
                folder: "./tmp/thumbnails",
                filename: `${outputFileName}.png`,
            })
                .on("end", async () => {
                const data = await readFile(outputFilePath);
                const webpData = await sharp_1.default(data).webp().toBuffer();
                resolve(webpData);
                await deleteFile(outputFilePath);
            });
        }
        catch {
            await deleteFile(outputFilePath);
        }
    });
};
const createS3ObjectPath = async ({ data, domain, id, sourceType = "image", ext, }) => {
    let contentType; // s3に保存する際に指定するタイプ
    let s3Ext; // 最終的にs3で保存する際に使う拡張子
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
    const randomString = crypto_1.createRandomString();
    const fileName = randomString.replace(/\//g, "w"); // / を全て変換。ファイル名をランダムな文字列にすることでなるべくセキュアにする
    const key = `${id}/${domain}/${fileName}.${s3Ext}`; // s3内のパス
    const fileData = data.replace(/^data:\w+\/\w+;base64,/, ""); // 接頭語を取り出す
    const decodedData = Buffer.from(fileData, "base64");
    const paramsWithputBody = {
        Bucket: process.env.BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    };
    let sourceBufferData;
    let thumbnailBufferData;
    console.log(width + ":" + height);
    if (sourceType === "image") {
        sourceBufferData = await sharp_1.default(decodedData)
            .rotate() // exifの関係でrotate()つけないと回転率が変になる時ある https://stackoverflow.com/questions/48716266/sharp-image-library-rotates-image-when-resizing
            .resize(width, height)
            .webp()
            .toBuffer();
    }
    else {
        const inputFileName = crypto_1.createRandomString().replace(/\//g, "");
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
        }
        catch {
            await deleteFile(inputFilePath);
        }
    }
    const params = {
        ...paramsWithputBody,
        Body: sourceBufferData,
    };
    let thumbnailParams;
    if (thumbnailBufferData) {
        thumbnailParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: `${id}/${domain}/${fileName}_thumbnail.webp`,
            ContentType: "image/webp",
            Body: thumbnailBufferData,
        };
    }
    let urlData;
    if (thumbnailParams) {
        const result = await Promise.all([upload(params), upload(thumbnailParams)]);
        urlData = {
            source: result[0],
            thumbnail: result[1],
        };
    }
    else {
        const url = await upload(params);
        urlData = {
            source: url,
        };
    }
    return urlData;
};
exports.createS3ObjectPath = createS3ObjectPath;
