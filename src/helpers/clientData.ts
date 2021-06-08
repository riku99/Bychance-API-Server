import {
  User,
  Post,
  Flash,
  TalkRoom,
  TalkRoomMessage,
  ReadTalkRoomMessage,
  ViewedFlash,
  DeleteTalkRoom,
  FlashStamp,
} from "@prisma/client";

import {
  ClientData,
  ClientTalkRoom,
  ClientTalkRoomMessage,
  FlashStampData,
  ClientFlashStamp,
} from "~/types/clientData";
import { serializeUser } from "~/serializers/user";
import { serializePost } from "~/serializers/post";
import { serializeFlash } from "~/serializers/flash";
import { serializeTalkRoom } from "~/serializers/talkRoom";
import { dayMs } from "~/constants/date";
import { serializeTalkRoomMessage } from "~/serializers/talkRoomMessage";
import { createAnotherUser } from "~/helpers/anotherUser";

export const filterByDayDiff = (timestamp: Date) =>
  (new Date().getTime() - new Date(timestamp).getTime()) / dayMs < 10; // 作成してから7日以内の物を取り出す ここはあとで変える

type FlashWithIncludesItem = (Flash & {
  viewed: ViewedFlash[];
  stamps: FlashStamp[];
})[];

export type CreateClientDataArg = {
  user: User;
  posts: Post[];
  flashes: FlashWithIncludesItem;
  // includeされたデータなのでTalkRoom[]だけでなくrecipientなど他のデータもくっついてくる
  senderTalkRooms: (TalkRoom & {
    messages: TalkRoomMessage[];
    recipient: User & {
      flashes: FlashWithIncludesItem;
      posts: Post[];
    };
  })[];
  recipientTalkRooms: (TalkRoom & {
    messages: TalkRoomMessage[];
    sender: User & {
      posts: Post[];
      flashes: FlashWithIncludesItem;
    };
  })[];
  readTalkRoomMessages: ReadTalkRoomMessage[];
  viewedFlashes: ViewedFlash[];
};

export const createClientPostsData = (posts: CreateClientDataArg["posts"]) => {
  return posts.map((post) => serializePost({ post }));
};

export const createClientFlashesData = (
  flashes: CreateClientDataArg["flashes"]
) => {
  const notExpiredFlashes = flashes.filter((flash) =>
    filterByDayDiff(flash.createdAt)
  );
  return notExpiredFlashes.map((flash) => serializeFlash({ flash }));
};

export const createClientFlashStamps = (
  stamps: FlashStamp[],
  flashId: number
) => {
  let clientStampData: FlashStampData = {
    thumbsUp: {
      number: 0,
      userIds: [],
    },
    yusyo: {
      number: 0,
      userIds: [],
    },
    yoi: {
      number: 0,
      userIds: [],
    },
    itibann: {
      number: 0,
      userIds: [],
    },
    seikai: {
      number: 0,
      userIds: [],
    },
  };

  stamps.forEach((stamp) => {
    clientStampData[stamp.value].number += 1;
    clientStampData[stamp.value].userIds.push(stamp.userId);
  });

  return {
    flashId,
    data: clientStampData,
  };
};

const createClientFlashStampsFromFlashes = (flashes: FlashWithIncludesItem) => {
  const result = flashes
    .map((f) => {
      if (filterByDayDiff(f.createdAt)) {
        return createClientFlashStamps(f.stamps, f.id);
      }
    })
    .filter((f): f is Exclude<typeof f, undefined> => f !== undefined);

  return result;
};

export const createClientData = (data: CreateClientDataArg): ClientData => {
  const user = serializeUser({ user: data.user });
  const posts = createClientPostsData(data.posts);
  const flashes = createClientFlashesData(data.flashes);

  let clientFlashStamps: ClientFlashStamp[] = [];

  const myFlashStampsData = createClientFlashStampsFromFlashes(data.flashes);
  clientFlashStamps.push(...myFlashStampsData);

  let talkRooms: ClientTalkRoom[] = [];
  let talkRoomMessages: ClientTalkRoomMessage[] = [];
  const allTalkRooms = [...data.senderTalkRooms, ...data.recipientTalkRooms];

  allTalkRooms.forEach((talkRoom) => {
    // トークルームは存在しても作成相手からメッセージがきてない場合はrecipient側にはそのトークルームは表示させない。それを判断するために使うデータ
    let dataToBeDisplayed = false;

    // トークルームを作った側(sender側)ならその時点で表示させることを決定
    if (talkRoom.senderId === user.id) {
      dataToBeDisplayed = true;
    }

    talkRoom.messages.forEach((talkRoomMessage) => {
      // そのルームの受け取り側(recipient)でも相手からのメッセージが既に存在する場合(recieptがtrue)は表示させることを決定
      if (
        !dataToBeDisplayed &&
        talkRoomMessage.userId !== user.id &&
        talkRoomMessage.receipt
      ) {
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

  const chatPartners = recipientsAndSenders.map((user) => {
    const { posts, flashes, ...restUserData } = user;

    const chatpartnerFlashStampsData = createClientFlashStampsFromFlashes(
      flashes
    );
    clientFlashStamps.push(...chatpartnerFlashStampsData);

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
    flashStamps: clientFlashStamps,
  };

  return clietnData;
};
