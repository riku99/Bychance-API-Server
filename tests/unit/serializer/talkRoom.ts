import { TalkRoom, TalkRoomMessage, ReadTalkRoomMessage } from "@prisma/client";

import { serializeTalkRoom, ClientTalkRoom } from "~/serializers/talkRoom";

const talkRoom: TalkRoom = {
  id: 1,
  createdAt: new Date("2021-04-29T07:11:50.036Z"),
  updatedAt: new Date("2021-04-29T07:11:50.036Z"),
  senderId: "1",
  recipientId: "2",
};

const talkRoomMessages: TalkRoomMessage[] = [
  {
    id: 1,
    text: "久しぶり",
    createdAt: new Date("2021-04-29T07:11:50.036Z"),
    updatedAt: new Date("2021-04-29T07:11:50.036Z"),
    userId: "1",
    roomId: 1,
  },
  {
    id: 2,
    text: "どうしたの?",
    createdAt: new Date("2021-04-29T07:11:50.036Z"),
    updatedAt: new Date("2021-04-29T07:11:50.036Z"),
    userId: "2",
    roomId: 1,
  },
  {
    id: 3,
    text: "今電話できる?",
    createdAt: new Date("2021-04-29T07:11:50.036Z"),
    updatedAt: new Date("2021-04-29T07:11:50.036Z"),
    userId: "1",
    roomId: 1,
  },
  {
    id: 4,
    text: "なんで?",
    createdAt: new Date("2021-04-29T07:11:50.036Z"),
    updatedAt: new Date("2021-04-29T07:11:50.036Z"),
    userId: "2",
    roomId: 1,
  },
  {
    id: 5,
    text: "話したいことある",
    createdAt: new Date("2021-04-29T07:11:50.036Z"),
    updatedAt: new Date("2021-04-29T07:11:50.036Z"),
    userId: "1",
    roomId: 1,
  },
];

const readTalkRoomMessages: ReadTalkRoomMessage[] = [
  {
    id: 1,
    userId: "2",
    messageId: 1,
    roomId: 1,
    createdAt: new Date("2021-04-29T07:11:50.036Z"),
    updatedAt: new Date("2021-04-29T07:11:50.036Z"),
  },
  {
    id: 2,
    userId: "1",
    messageId: 2,
    roomId: 1,
    createdAt: new Date("2021-04-29T07:11:50.036Z"),
    updatedAt: new Date("2021-04-29T07:11:50.036Z"),
  },
  {
    id: 3,
    userId: "2",
    messageId: 3,
    roomId: 1,
    createdAt: new Date("2021-04-29T07:11:50.036Z"),
    updatedAt: new Date("2021-04-29T07:11:50.036Z"),
  },
  {
    id: 4,
    userId: "1",
    messageId: 4,
    roomId: 1,
    createdAt: new Date("2021-04-29T07:11:50.036Z"),
    updatedAt: new Date("2021-04-29T07:11:50.036Z"),
  },
];

const clientTalkRoom: ClientTalkRoom = {
  id: 1,
  partner: "1",
  messages: [1, 2, 3, 4, 5],
  unreadNumber: 1,
  latestMessage: "話したいことある",
  timeStamp: "timeStamp",
};

describe("talkRoom serializer", () => {
  test("clientTalkRoomを返す", () => {
    const result = serializeTalkRoom({
      talkRoom,
      talkRoomMessages,
      readTalkRoomMessages,
      userId: "2",
    });
    result.timeStamp = "timeStamp";

    expect(result).toEqual(clientTalkRoom);
  });
});
