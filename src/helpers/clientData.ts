import {
  User,
  Post,
  Flash,
  TalkRoom,
  TalkRoomMessage,
  ReadTalkRoomMessage,
  ViewedFlash,
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
import { createAnotherUser } from "~/helpers/anotherUser";
import { talkRoomMessage } from "~/../tests/data";

type Arg = {
  user: User;
  posts: Post[];
  flashes: Flash[];
  // includeされたデータなのでTalkRoom[]だけでなくrecipientなど他のデータもくっついてくる
  senderTalkRooms: (TalkRoom & {
    messages: TalkRoomMessage[];
    recipient: User & {
      flashes: Flash[];
      posts: Post[];
    };
  })[];
  recipientTalkRooms: (TalkRoom & {
    messages: TalkRoomMessage[];
    sender: User & {
      posts: Post[];
      flashes: Flash[];
    };
  })[];
  readTalkRoomMessages: ReadTalkRoomMessage[];
  viewedFlashes: ViewedFlash[];
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

  const allTalkRooms = [...data.senderTalkRooms, ...data.recipientTalkRooms];

  allTalkRooms.forEach((talkRoom) => {
    talkRoom.messages.forEach((talkRoomMessage) => {
      const serializedMessage = serializeTalkRoomMessage({ talkRoomMessage });
      talkRoomMessages.push(serializedMessage);
    });

    const readTalkRoomMessages = data.readTalkRoomMessages.filter(
      (readMessage) => readMessage.roomId === talkRoom.id
    );

    const serializedRoom = serializeTalkRoom({
      talkRoom,
      talkRoomMessages: talkRoom.messages,
      readTalkRoomMessages,
      userId: data.user.id,
    });

    talkRooms.push(serializedRoom);
  });

  const recipients = data.senderTalkRooms.map((talkRoom) => talkRoom.recipient);
  const senders = data.recipientTalkRooms.map((talkRoom) => talkRoom.sender);
  const recipientsAndSenders = [...recipients, ...senders];

  const chatPartners = recipientsAndSenders.map((user) => {
    const { posts, flashes, ...restUserData } = user;
    return createAnotherUser({
      user: restUserData,
      posts,
      flashes,
      viewedFlashes: data.viewedFlashes,
    });
  });

  const clietnData: ClientData = {
    user,
    posts,
    flashes,
    rooms: talkRooms,
    messages: talkRoomMessages,
    chatPartners,
  };

  return clietnData;
};
