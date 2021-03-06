import { serializeTalkRoomMessage } from "~/serializers/talkRoomMessage";
import { talkRoomMessage, clietnTalkRoomMessage } from "../../data";

describe("talkRoomMessage serializer", () => {
  test("lietnTalkRoomMessagを返す", () => {
    const result = serializeTalkRoomMessage({ talkRoomMessage });
    result.timestamp = "timestamp";

    expect(result).toEqual(clietnTalkRoomMessage);
  });
});
