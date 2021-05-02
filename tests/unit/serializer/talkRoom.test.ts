import { serializeTalkRoom } from "~/serializers/talkRoom";
import {
  talkRoom,
  clientTalkRoom,
  talkRoomMessage,
  readTalkRoomMessage,
} from "../../data";

describe("talkRoom serializer", () => {
  test("clientTalkRoomを返す", () => {
    const result = serializeTalkRoom({
      talkRoom,
      talkRoomMessages: [talkRoomMessage],
      readTalkRoomMessages: [readTalkRoomMessage],
      userId: "1",
    });
    result.timestamp = "timestamp";

    expect(result).toEqual(clientTalkRoom);
  });
});
