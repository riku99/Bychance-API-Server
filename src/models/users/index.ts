// import { PrismaClient, User as UserType } from "@prisma/client";

// const prisma = new PrismaClient();

// const create = async (
//   data: Pick<UserType, "lineId" | "name" | "accessToken" | "avatar">
// ) => {
//   const result = await prisma.user.create({
//     data,
//   });

//   return result;
// };

// モデルには複雑なクエリかつ複数回使われそうな物を書くようにする。
// それ以外はとりあえずhandlerで直接prisma呼び出せばいいと思う
