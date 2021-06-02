import { User } from "@prisma/client";
import { ClientPost, ClientFlash } from "./clientData";

type AnotherUserFlashData = {
  entities: ClientFlash[];
  alreadyViewed: number[];
  isAllAlreadyViewed?: boolean;
};

export type AnotherUser = Pick<
  User,
  | "id"
  | "name"
  | "avatar"
  | "introduce"
  | "statusMessage"
  | "backGroundItem"
  | "backGroundItemType"
  | "instagram"
  | "twitter"
  | "youtube"
  | "tiktok"
> & {
  posts: ClientPost[];
  flashes: AnotherUserFlashData;
  lat: number | null;
  lng: number | null;
};
