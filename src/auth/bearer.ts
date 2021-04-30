import Hapi from "@hapi/hapi";

import {
  PrismaClient,
  User,
  Post,
  Flash,
  TalkRoom,
  TalkRoomMessage,
  ReadTalkRoomMessage,
} from "@prisma/client";
import { createHash } from "~/helpers/crypto";
import { userIncludes } from "~/prisma/includes/users";

const prisma = new PrismaClient();

export type Artifacts = User & {
  posts: Post[];
  flashes: Flash[];
  senderTalkRooms: TalkRoom[];
  recipientTalkRooms: TalkRoom[];
  talkRoomMessages: TalkRoomMessage[];
  readTalkRoomMessages: ReadTalkRoomMessage[];
};

type ReturnType =
  | {
      isValid: false;
      credentials: {};
    }
  | {
      isValid: true;
      credentials: {};
      artifacts: Artifacts;
    };

// 認可が必要なAPIのAuthorizationヘッダ + クエリのidフィールドはこの認可プロセスで検証を行えるのでそのためのバリデーションは定義する必要ない
export const checkBeareAccessToken = async (
  request: Hapi.Request,
  token: string,
  h: Hapi.ResponseToolkit
): Promise<ReturnType> => {
  const id = request.query.id as string | undefined;

  if (!id) {
    // Boomを使ったエラーのスローはstrategy作成時のunauthorizeに実装する
    // throwLoginError();
    return { isValid: false, credentials: {} };
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: userIncludes.createClient,
  });

  if (!user) {
    return { isValid: false, credentials: {} };
  }

  const isSame = user.accessToken === createHash(token);

  if (!isSame) {
    return { isValid: false, credentials: {} };
  }

  // credentialsは例えisValidがfalseでも、trueだがhandler内で必要なくても定義しないとダメ
  return { isValid: true, credentials: {}, artifacts: user };
};
