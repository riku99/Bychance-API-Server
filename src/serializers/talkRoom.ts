import { TalkRoom, TalkRoomMessage, readTalkRoomMessage } from "@prisma/client";

export type ClientTalkRoom = Pick<TalkRoom, "id"> & {
  partner: string;
  messages: number[];
  unreadNumber: number;
  latestMessage: string | null;
};

export const serializeTalkRoom = ({
  talkRoom,
  talkRoomMessages,
  readTalkRoomMessages,
  userId,
}: {
  talkRoom: TalkRoom;
  talkRoomMessages: TalkRoomMessage[];
  readTalkRoomMessages: readTalkRoomMessage[];
  userId: string;
}): ClientTalkRoom => {
  const partner =
    talkRoom.senderId === userId ? talkRoom.recipientId : talkRoom.recipientId;
  const messages = talkRoomMessages.map((message) => message.id);
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
  };

  return clientTalkRoom;
};
