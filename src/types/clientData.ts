import { User } from "@prisma/client";
import { TalkRoomMessage } from "@prisma/client";
import { TalkRoom } from "@prisma/client";
import { Post } from "@prisma/client";
import { Flash } from "@prisma/client";

export type ClientUser = Omit<
  User,
  "lineId" | "createdAt" | "updatedAt" | "accessToken"
>;

export type ClientPost = Pick<Post, "id" | "image" | "text" | "userId"> & {
  date: string;
};

export type ClientTalkRoom = Pick<TalkRoom, "id"> & {
  partner: string;
  messages: number[];
  unreadNumber: number;
  latestMessage: string | null;
  timeStamp: string;
};

export type ClientTalkRoomMessage = Pick<
  TalkRoomMessage,
  "id" | "userId" | "roomId" | "text"
> & { timeStamp: string };

export type ClientFlash = Pick<Flash, "id" | "sourceType" | "source"> & {
  timeStamp: string;
};

// 後々roomsをtalkRoomsに、messagesをtalkMessagesに変えたい
export type ClientData = {
  user: ClientUser;
  posts: ClientPost[];
  rooms: ClientTalkRoom[];
  messages: ClientTalkRoomMessage[];
  flashes: ClientFlash[];
  //chatPartners: AnotherUser[]; AnotherUserを定義したらこちらに変更
  chatPartners: [];
};
