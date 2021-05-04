import {
  User,
  Post,
  Flash,
  TalkRoom,
  TalkRoomMessage,
  ReadTalkRoomMessage,
} from "@prisma/client";

import {
  ClientUser,
  ClientPost,
  ClientFlash,
  ClientTalkRoom,
  ClientTalkRoomMessage,
} from "~/types/clientData";

export const user: User = {
  id: "1",
  lineId: "lineline",
  name: "sutehage",
  avatar: "ava",
  introduce: "Hey!",
  statusMessage: "hello",
  display: true,
  createdAt: new Date("2021-04-01"),
  updatedAt: new Date("2021-04-01"),
  accessToken: "token",
  lat: "here",
  lng: "here",
};

export const clientUser: ClientUser = {
  id: "1",
  name: "sutehage",
  avatar: "ava",
  introduce: "Hey!",
  statusMessage: "hello",
  display: true,
  lat: 1,
  lng: 2,
};

export const post: Post = {
  id: 1,
  image: "image",
  text: "text",
  createdAt: new Date("2021-04-29T07:11:50.036Z"),
  updatedAt: new Date("2021-04-29T07:11:50.036Z"),
  userId: "userId",
};

export const clientPost: ClientPost = {
  id: 1,
  image: "image",
  text: "text",
  userId: "userId",
  date: "2021/4/29",
};

export const flash: Flash = {
  id: 1,
  source: "sourceURL",
  sourceType: "image",
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: "1",
};

export const clientFlash: ClientFlash = {
  id: 1,
  source: "sourceURL",
  sourceType: "image",
  timestamp: "timestamp",
};

export const talkRoom: TalkRoom = {
  id: 1,
  createdAt: new Date("2021-04-29T07:11:50.036Z"),
  updatedAt: new Date("2021-04-29T07:11:50.036Z"),
  senderId: "1",
  recipientId: "2",
};

export const clientTalkRoom: ClientTalkRoom = {
  id: 1,
  partner: "2",
  //messages: [1, 2, 3, 4, 5],
  messages: [1],
  unreadNumber: 0,
  latestMessage: "Hey",
  timestamp: "timestamp",
};

export const talkRoomMessage: TalkRoomMessage = {
  id: 1,
  userId: "1",
  roomId: 1,
  text: "Hey",
  createdAt: new Date("2021-04-29T07:11:50.036Z"),
  updatedAt: new Date("2021-04-29T07:11:50.036Z"),
};

export const clietnTalkRoomMessage: ClientTalkRoomMessage = {
  id: 1,
  userId: "1",
  roomId: 1,
  text: "Hey",
  timestamp: "timestamp",
};

export const readTalkRoomMessage: ReadTalkRoomMessage = {
  id: 1,
  userId: "2",
  messageId: 1,
  roomId: 1,
  createdAt: new Date("2021-04-29T07:11:50.036Z"),
  updatedAt: new Date("2021-04-29T07:11:50.036Z"),
};

// export const talkRoomMessages: TalkRoomMessage[] = [
//   {
//     id: 1,
//     text: "久しぶり",
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//     userId: "1",
//     roomId: 1,
//   },
//   {
//     id: 2,
//     text: "どうしたの?",
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//     userId: "2",
//     roomId: 1,
//   },
//   {
//     id: 3,
//     text: "今電話できる?",
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//     userId: "1",
//     roomId: 1,
//   },
//   {
//     id: 4,
//     text: "なんで?",
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//     userId: "2",
//     roomId: 1,
//   },
//   {
//     id: 5,
//     text: "話したいことある",
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//     userId: "1",
//     roomId: 1,
//   },
// ];

// export const readTalkRoomMessages: ReadTalkRoomMessage[] = [
//   {
//     id: 1,
//     userId: "2",
//     messageId: 1,
//     roomId: 1,
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//   },
//   {
//     id: 2,
//     userId: "1",
//     messageId: 2,
//     roomId: 1,
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//   },
//   {
//     id: 3,
//     userId: "2",
//     messageId: 3,
//     roomId: 1,
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//   },
//   {
//     id: 4,
//     userId: "1",
//     messageId: 4,
//     roomId: 1,
//     createdAt: new Date("2021-04-29T07:11:50.036Z"),
//     updatedAt: new Date("2021-04-29T07:11:50.036Z"),
//   },
// ];
