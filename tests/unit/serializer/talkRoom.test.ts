import { TalkRoom, TalkRoomMessage, ReadTalkRoomMessage } from "@prisma/client";

import { serializeTalkRoom } from "~/serializers/talkRoom";
import { ClientTalkRoom } from "~/types/clientData";
import {
  talkRoom,
  talkRoomMessages,
  readTalkRoomMessages,
  clientTalkRoom,
} from "../../data";

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
