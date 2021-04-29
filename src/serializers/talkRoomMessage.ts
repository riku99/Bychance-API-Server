import { TalkRoomMessage } from "@prisma/client";

export type ClientTalkRoomMessage = Pick<
  TalkRoomMessage,
  "id" | "userId" | "roomId" | "text"
> & { timeStamp: string };

export const serializeTalkRoomMessage = ({
  talkRoomMessage,
}: {
  talkRoomMessage: TalkRoomMessage;
}): ClientTalkRoomMessage => {
  const { id, userId, roomId, text } = talkRoomMessage;
  const timeStamp = talkRoomMessage.createdAt.toString();

  const clientMessage: ClientTalkRoomMessage = {
    id,
    userId,
    roomId,
    text,
    timeStamp,
  };

  return clientMessage;
};
