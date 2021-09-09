// import { TalkRoomMessage } from "@prisma/client";

// import { ClientTalkRoomMessage } from "~/types/clientData";

// export const serializeTalkRoomMessage = ({
//   talkRoomMessage,
// }: {
//   talkRoomMessage: TalkRoomMessage;
// }): ClientTalkRoomMessage => {
//   const { id, userId, roomId, text } = talkRoomMessage;
//   const timestamp = talkRoomMessage.createdAt.toString();

//   const clientMessage: ClientTalkRoomMessage = {
//     id,
//     userId,
//     roomId,
//     text,
//     timestamp,
//   };

//   return clientMessage;
// };
