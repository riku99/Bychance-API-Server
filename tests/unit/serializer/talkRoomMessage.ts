import { TalkRoomMessage } from "@prisma/client";

import {
  serializeTalkRoomMessage,
  ClientTalkRoomMessage,
} from "~/serializers/talkRoomMessage";

const talkRoomMessage: TalkRoomMessage = {
  id: 1,
  userId: "1",
  roomId: 1,
  text: "Hey",
  createdAt: new Date("2021-04-29T07:11:50.036Z"),
  updatedAt: new Date("2021-04-29T07:11:50.036Z"),
};

const clietnTalkRoomMessage: ClientTalkRoomMessage = {
  id: 1,
  userId: "1",
  roomId: 1,
  text: "Hey",
  timeStamp: "timeStamp",
};

describe("talkRoomMessage serializer", () => {
  test("lietnTalkRoomMessagを返す", () => {
    const result = serializeTalkRoomMessage({ talkRoomMessage });
    result.timeStamp = "timeStamp";

    expect(result).toEqual(clietnTalkRoomMessage);
  });
});
