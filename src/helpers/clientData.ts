import {
  User,
  Post,
  Flash,
  TalkRoom,
  TalkRoomMessage,
  ReadTalkRoomMessage,
} from "@prisma/client";

import {
  ClientData,
  ClientTalkRoom,
  ClientTalkRoomMessage,
} from "~/types/clientData";
import { serializeUser } from "~/serializers/user";
import { serializePost } from "~/serializers/post";
import { serializeFlash } from "~/serializers/flash";
import { serializeTalkRoom } from "~/serializers/talkRoom";
import { dayMs } from "~/constants/date";
import { serializeTalkRoomMessage } from "~/serializers/talkRoomMessage";

type Arg = {
  user: User;
  posts: Post[];
  flashes: Flash[];
  talkRooms: TalkRoom[];
  talkRoomMessages: TalkRoomMessage[];
  readTalkRoomMessages: ReadTalkRoomMessage[];
};

export const createClientData = (data: Arg): ClientData => {
  const user = serializeUser({ user: data.user });
  const posts = data.posts.map((post) => serializePost({ post }));
  const notExpiredFlashes = data.flashes.filter(
    (flash) =>
      (new Date().getTime() - new Date(flash.createdAt).getTime()) / dayMs < 2 // 作成してから2日以内の物を取り出す
  );
  const flashes = notExpiredFlashes.map((flash) => serializeFlash({ flash }));

  let talkRooms: ClientTalkRoom[] = [];
  let talkRoomMessages: ClientTalkRoomMessage[] = [];

  data.talkRooms.forEach((talkRoom) => {
    const relatedMessages = data.talkRoomMessages.filter(
      (message) => message.roomId === talkRoom.id
    );

    relatedMessages.forEach((talkRoomMessage) => {
      const serializedMessage = serializeTalkRoomMessage({ talkRoomMessage });
      talkRoomMessages.push(serializedMessage);
    });

    const readTalkRoomMessages = data.readTalkRoomMessages.filter(
      (readMessage) => readMessage.roomId === talkRoom.id
    );

    const serializedRoom = serializeTalkRoom({
      talkRoom,
      talkRoomMessages: relatedMessages,
      readTalkRoomMessages,
      userId: data.user.id,
    });

    talkRooms.push(serializedRoom);
  });

  const clietnData: ClientData = {
    user,
    posts,
    flashes,
    rooms: talkRooms,
    messages: talkRoomMessages,
    chatPartners: [],
  };

  return clietnData;
};
