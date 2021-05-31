import {
  User,
  Post,
  Flash,
  TalkRoom,
  TalkRoomMessage,
  ReadTalkRoomMessage,
  ViewedFlash,
  DeleteTalkRoom,
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

export const filterByDayDiff = (timestamp: Date) =>
  (new Date().getTime() - new Date(timestamp).getTime()) / dayMs < 3; // 作成してから1日以内の物を取り出す

type Arg = {
  user: User;
  posts: Post[];
  flashes: (Flash & { viewed: ViewedFlash[] })[];
  // includeされたデータなのでTalkRoom[]だけでなくrecipientなど他のデータもくっついてくる
  senderTalkRooms: (TalkRoom & {
    messages: TalkRoomMessage[];
    recipient: User & {
      flashes: (Flash & { viewed: ViewedFlash[] })[];
      posts: Post[];
    };
  })[];
  recipientTalkRooms: (TalkRoom & {
    messages: TalkRoomMessage[];
    sender: User & {
      posts: Post[];
      flashes: (Flash & { viewed: ViewedFlash[] })[];
    };
  })[];
  readTalkRoomMessages: ReadTalkRoomMessage[];
  viewedFlashes: ViewedFlash[];
  deleteTalkRooms: (DeleteTalkRoom & { talkRoom: TalkRoom })[];
};

export const createClientData = (data: Arg): ClientData => {
  const user = serializeUser({ user: data.user });
  const posts = data.posts.map((post) => serializePost({ post }));
  const notExpiredFlashes = data.flashes.filter((flash) =>
    filterByDayDiff(flash.createdAt)
  );
  const flashes = notExpiredFlashes.map((flash) => serializeFlash({ flash }));

  let talkRooms: ClientTalkRoom[] = [];
  let talkRoomMessages: ClientTalkRoomMessage[] = [];
  const allTalkRooms = [...data.senderTalkRooms, ...data.recipientTalkRooms];
  const deletedTalkRoomIds = data.deleteTalkRooms.map((d) => d.talkRoomId);

  allTalkRooms.forEach((talkRoom) => {
    // 論理的に削除されている(DBには残っている)データの場合その時点でリターン。
    if (deletedTalkRoomIds.includes(talkRoom.id)) {
      return;
    }
    // トークルームは存在しても作成相手からメッセージがきてない場合はrecipient側にはそのトークルームは表示させない。それを判断するために使うデータ
    let dataToBeDisplayed = false;

    // トークルームを作った側(sender側)ならその時点で表示させることを決定
    if (talkRoom.senderId === user.id) {
      dataToBeDisplayed = true;
    }

    talkRoom.messages.forEach((talkRoomMessage) => {
      // そのルームの受け取り側(recipient)でも相手からのメッセージが既に存在する場合は表示させることを決定
      if (!dataToBeDisplayed && talkRoomMessage.userId !== user.id) {
        dataToBeDisplayed = true;
      }

      // talkRoomMessageのrecieptがfalseでも送ったのが自分の場合は追加する。falseでかつ相手から送られてきたものの場合表示させないので追加しない
      if (talkRoomMessage.receipt || talkRoomMessage.userId === data.user.id) {
        const serializedMessage = serializeTalkRoomMessage({ talkRoomMessage });
        talkRoomMessages.push(serializedMessage);
      }
    });

    if (dataToBeDisplayed) {
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
    }
  });

  const recipients = data.senderTalkRooms.map((talkRoom) => talkRoom.recipient);
  const senders = data.recipientTalkRooms.map((talkRoom) => talkRoom.sender);
  const recipientsAndSenders = [...recipients, ...senders];
  const deletedTalkRoomPartnerIds = data.deleteTalkRooms.map((deletedRooms) => {
    const senderId = deletedRooms.talkRoom.senderId;
    const recipientId = deletedRooms.talkRoom.recipientId;
    return senderId !== data.user.id ? senderId : recipientId;
  });
  // 削除登録されているルームのパートナーはデータから抜く
  const filterdPartners = recipientsAndSenders.filter(
    (partner) => !deletedTalkRoomPartnerIds.includes(partner.id)
  );

  const chatPartners = filterdPartners.map((user) => {
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
