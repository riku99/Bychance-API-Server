// import { TalkRoom, TalkRoomMessage, ReadTalkRoomMessage } from "@prisma/client";

// import { ClientTalkRoom } from "~/types/clientData";

// export const serializeTalkRoom = ({
//   talkRoom,
//   talkRoomMessages,
//   readTalkRoomMessages,
//   userId,
// }: {
//   talkRoom: TalkRoom;
//   talkRoomMessages: TalkRoomMessage[];
//   readTalkRoomMessages: ReadTalkRoomMessage[];
//   userId: string;
// }): ClientTalkRoom => {
//   const partner =
//     talkRoom.senderId === userId ? talkRoom.recipientId : talkRoom.senderId;
//   const messageIds = talkRoomMessages.map((message) => message.id).reverse(); // メッセージの表示の関係で新しいやつ順にする
//   const messagesWithoutMine = talkRoomMessages.filter(
//     (message) => message.userId !== userId && message.receipt // message.recieptによりメッセージを受け取らない状態の時に相手が送信したものは含めない(receiptがfalse)。これないと未読数のデータに本来受け取らないはずのデータが入ってしまいおかしくなる
//   );
//   const readMessages = readTalkRoomMessages.filter(
//     (data) => data.userId === userId
//   );
//   const unreadNumber = messagesWithoutMine.length - readMessages.length;

//   const latestMessage = talkRoomMessages
//     .reverse()
//     .find((m) => m.userId === userId || m.receipt);

//   const clientTalkRoom: ClientTalkRoom = {
//     id: talkRoom.id,
//     partner,
//     messages: messageIds,
//     unreadNumber,
//     latestMessage: latestMessage ? latestMessage.text : null,
//     timestamp: talkRoom.updatedAt.toString(),
//   };

//   return clientTalkRoom;
// };
