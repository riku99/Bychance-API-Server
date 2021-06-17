import { User } from "@prisma/client";
import { TalkRoomMessage } from "@prisma/client";
import { TalkRoom } from "@prisma/client";
import { Post } from "@prisma/client";
import { Flash, FlashStamp } from "@prisma/client";

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
  | "showReceiveMessage"
  | "talkRoomMessageReceipt"
  | "videoEditDescription"
> & { lat: number | null; lng: number | null };

export type ClientPost = Pick<
  Post,
  "id" | "url" | "text" | "userId" | "sourceType"
> & {
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
  viewsNumber: number;
};

type StampValues = FlashStamp["value"];
export type FlashStampValuesData = Record<
  StampValues,
  {
    number: number;
    userIds: string[];
  }
>;

export type ClientFlashStamp = {
  flashId: number;
  data: FlashStampValuesData;
};

export type ClientPrivateZone = {
  id: number;
  address: string;
};

// 後々roomsをtalkRoomsに、messagesをtalkMessagesに変えたい
export type ClientData = {
  user: ClientUser;
  posts: ClientPost[];
  rooms: ClientTalkRoom[];
  chatPartners: AnotherUser[];
  messages: ClientTalkRoomMessage[];
  flashes: ClientFlash[];
  flashStamps: ClientFlashStamp[];
};
