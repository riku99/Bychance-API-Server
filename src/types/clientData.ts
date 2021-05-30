import { User } from "@prisma/client";
import { TalkRoomMessage } from "@prisma/client";
import { TalkRoom } from "@prisma/client";
import { Post } from "@prisma/client";
import { Flash } from "@prisma/client";

import { AnotherUser } from "~/types/anotherUser";

export type ClientUser = Pick<
  User,
  | "id"
  | "name"
  | "avatar"
  | "introduce"
  | "statusMessage"
  | "display"
  | "backGroundItem"
  | "backGroundItemType"
  | "instagram"
  | "twitter"
  | "youtube"
  | "tiktok"
> & { lat: number | null; lng: number | null };

export type ClientPost = Pick<Post, "id" | "image" | "text" | "userId"> & {
  date: string;
};

export type ClientTalkRoom = Pick<TalkRoom, "id"> & {
  partner: string;
  messages: number[];
  unreadNumber: number;
  latestMessage: string | null;
  timestamp: string;
};

export type ClientTalkRoomMessage = Pick<
  TalkRoomMessage,
  "id" | "userId" | "roomId" | "text"
> & { timestamp: string };

export type ClientFlash = Pick<Flash, "id" | "sourceType" | "source"> & {
  timestamp: string;
  viewNumber: number;
};

// 後々roomsをtalkRoomsに、messagesをtalkMessagesに変えたい
export type ClientData = {
  user: ClientUser;
  posts: ClientPost[];
  rooms: ClientTalkRoom[];
  messages: ClientTalkRoomMessage[];
  flashes: ClientFlash[];
  chatPartners: AnotherUser[];
};
