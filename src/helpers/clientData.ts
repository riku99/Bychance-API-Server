// import {
//   User,
//   Post,
//   Flash,
//   TalkRoom,
//   TalkRoomMessage,
//   ReadTalkRoomMessage,
//   ViewedFlash,
//   FlashStamp,
// } from "@prisma/client";

// import {
//   ClientData,
//   ClientTalkRoom,
//   ClientTalkRoomMessage,
//   ClientFlashStamp,
// } from "~/types/clientData";
// import { serializeUser } from "~/serializers/user";
// import { serializeTalkRoom } from "~/serializers/talkRoom";
// import { serializeTalkRoomMessage } from "~/serializers/talkRoomMessage";
// import { createAnotherUser } from "~/helpers/anotherUser";
// import {
//   createClientFlashStamps,
//   createClientFlashes,
// } from "~/helpers/flashes";
// import { createClientPosts } from "~/helpers/posts";

// export type PostsWithIncludesItem = Post[];

// export type FlashWithIncludesItem = (Flash & {
//   viewed: ViewedFlash[];
//   stamps: FlashStamp[];
// })[];

// export type CreateClientDataArg = {
//   user: User;
//   posts: PostsWithIncludesItem;
//   flashes: FlashWithIncludesItem;
//   // includeされたデータなのでTalkRoom[]だけでなくrecipientなど他のデータもくっついてくる
//   senderTalkRooms: (TalkRoom & {
//     messages: TalkRoomMessage[];
//     recipient: User & {
//       flashes: FlashWithIncludesItem;
//       posts: Post[];
//     };
//   })[];
//   recipientTalkRooms: (TalkRoom & {
//     messages: TalkRoomMessage[];
//     sender: User & {
//       posts: Post[];
//       flashes: FlashWithIncludesItem;
//     };
//   })[];
//   readTalkRoomMessages: ReadTalkRoomMessage[];
//   viewedFlashes: ViewedFlash[];
// };

// export const createClientData = (data: CreateClientDataArg): ClientData => {
//   const user = serializeUser({ user: data.user });
//   const posts = createClientPosts(data.posts);
//   const flashes = createClientFlashes(data.flashes);

//   let clientFlashStamps: ClientFlashStamp[] = [];

//   const myFlashStampsData = createClientFlashStamps(data.flashes);
//   clientFlashStamps.push(...myFlashStampsData);

//   let talkRooms: ClientTalkRoom[] = [];
//   let talkRoomMessages: ClientTalkRoomMessage[] = [];
//   const allTalkRooms = [...data.senderTalkRooms, ...data.recipientTalkRooms];

//   allTalkRooms.forEach((talkRoom) => {
//     // トークルームは存在しても作成相手からメッセージがきてない場合はrecipient側にはそのトークルームは表示させない。それを判断するために使うデータ
//     let dataToBeDisplayed = false;

//     // トークルームを作った側(sender側)ならその時点で表示させることを決定
//     if (talkRoom.senderId === user.id) {
//       dataToBeDisplayed = true;
//     }

//     talkRoom.messages.forEach((talkRoomMessage) => {
//       // そのルームの受け取り側(recipient)でも相手からのメッセージが既に存在する場合(recieptがtrue)は表示させることを決定
//       if (
//         !dataToBeDisplayed &&
//         talkRoomMessage.userId !== user.id &&
//         talkRoomMessage.receipt
//       ) {
//         dataToBeDisplayed = true;
//       }

//       // talkRoomMessageのrecieptがfalseでも送ったのが自分の場合は追加する。falseでかつ相手から送られてきたものの場合表示させないので追加しない
//       if (talkRoomMessage.receipt || talkRoomMessage.userId === data.user.id) {
//         const serializedMessage = serializeTalkRoomMessage({ talkRoomMessage });
//         talkRoomMessages.push(serializedMessage);
//       }
//     });

//     if (dataToBeDisplayed) {
//       const readTalkRoomMessages = data.readTalkRoomMessages.filter(
//         (readMessage) => readMessage.roomId === talkRoom.id
//       );

//       const serializedRoom = serializeTalkRoom({
//         talkRoom,
//         talkRoomMessages: talkRoom.messages,
//         readTalkRoomMessages,
//         userId: data.user.id,
//       });

//       talkRooms.push(serializedRoom);
//     }
//   });

//   const recipients = data.senderTalkRooms.map((talkRoom) => talkRoom.recipient);
//   const senders = data.recipientTalkRooms.map((talkRoom) => talkRoom.sender);
//   const recipientsAndSenders = [...recipients, ...senders];

//   const chatPartners = recipientsAndSenders.map((user) => {
//     const { posts, flashes, ...restUserData } = user;

//     const chatpartnerFlashStampsData = createClientFlashStamps(flashes);
//     clientFlashStamps.push(...chatpartnerFlashStampsData);

//     return createAnotherUser({
//       user: restUserData,
//       posts,
//       flashes,
//       viewedFlashes: data.viewedFlashes,
//     });
//   });

//   const clietnData: ClientData = {
//     user,
//     posts,
//     flashes,
//     rooms: talkRooms,
//     messages: talkRoomMessages,
//     chatPartners,
//     flashStamps: clientFlashStamps,
//   };

//   return clietnData;
// };
