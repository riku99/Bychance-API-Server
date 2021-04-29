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
  timeStamp: "Thu Apr 29 2021 16:11:50 GMT+0900 (GMT+09:00)",
};

describe("talkRoomMessageSerializer", () => {
  test("lietnTalkRoomMessagを返す", () => {
    const result = serializeTalkRoomMessage({ talkRoomMessage });

    expect(result).toEqual(clietnTalkRoomMessage);
  });
});
