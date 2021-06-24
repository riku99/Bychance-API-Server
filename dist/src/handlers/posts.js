"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postHandler = void 0;
const client_1 = require("@prisma/client");
const post_1 = require("~/serializers/post");
const aws_1 = require("~/helpers/aws");
const errors_1 = require("~/helpers/errors");
const prisma = new client_1.PrismaClient();
const createPost = async (req, h) => {
    const user = req.auth.artifacts;
    const payload = req.payload;
    const url = await aws_1.createS3ObjectPath({
        data: payload.source,
        domain: "post",
        id: user.id,
        ext: payload.ext,
        sourceType: payload.sourceType,
    });
    if (!url) {
        return errors_1.throwInvalidError();
    }
    const post = await prisma.post.create({
        data: {
            url: url.source,
            text: payload.text,
            sourceType: payload.sourceType,
            user: {
                connect: { id: user.id },
            },
        },
    });
    return post_1.serializePost({ post });
};
const deletePost = async (req, h) => {
    const user = req.auth.artifacts;
    const payload = req.payload;
    // 削除するのは一件だが、複数条件(id, userId)で削除したいためdeleteManyを使用
    // deleteUniqueだとuniuqeなカラム(POSTだとid)でしか指定できない
    // https://github.com/prisma/prisma/discussions/4185
    const result = await prisma.post.deleteMany({
        where: { id: payload.postId, userId: user.id },
    });
    if (!result.count) {
        return errors_1.throwInvalidError();
    }
    return h.response().code(200);
};
exports.postHandler = {
    createPost,
    deletePost,
};
