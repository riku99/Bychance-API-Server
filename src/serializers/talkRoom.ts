import { TalkRoom, TalkRoomMessage, ReadTalkRoomMessage } from "@prisma/client";

import { ClientTalkRoom } from "~/types/clientData";

export const serializeTalkRoom = ({
  talkRoom,
  talkRoomMessages,
  readTalkRoomMessages,
  userId,
}: {
  talkRoom: TalkRoom;
  talkRoomMessages: TalkRoomMessage[];
  readTalkRoomMessages: ReadTalkRoomMessage[];
  userId: string;
}): ClientTalkRoom => {
  const partner =
    talkRoom.senderId === userId ? talkRoom.recipientId : talkRoom.senderId;
  const messages = talkRoomMessages.map((message) => message.id).reverse(); // メッセージの表示の関係で新しいやつ順にする
  const messagesWithoutMine = talkRoomMessages.filter(
    (message) => message.userId !== userId
  );
  const readMessages = readTalkRoomMessages.filter(
    (data) => data.userId === userId
  );
  const unreadNumber = messagesWithoutMine.length - readMessages.length;
  const latestMessage = talkRoomMessages.length
    ? talkRoomMessages[talkRoomMessages.length - 1].text
    : null;

  const clientTalkRoom: ClientTalkRoom = {
    id: talkRoom.id,
    partner,
    messages,
    unreadNumber,
    latestMessage,
    timestamp: talkRoom.updatedAt.toString(),
  };

  return clientTalkRoom;
};
