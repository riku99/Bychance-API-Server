import { User } from "@prisma/client";
import { ClientPost, ClientFlash } from "./clientData";

type AnotherUserFlashData = {
  entities: ClientFlash[];
  alreadyViewed: number[];
  isAllAlreadyViewed?: boolean;
};

export type AnotherUser = Pick<
  User,
  "id" | "name" | "avatar" | "introduce" | "statusMessage"
> & { posts: ClientPost[] } & { flashes: AnotherUserFlashData };
