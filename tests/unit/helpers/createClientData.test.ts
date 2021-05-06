import {
  user,
  clientUser,
  post,
  clientPost,
  flash,
  clientFlash,
  talkRoom,
  clientTalkRoom,
  talkRoomMessage,
  clietnTalkRoomMessage,
  readTalkRoomMessage,
} from "../../data";
import { ClientData } from "~/types/clientData";
import { createClientData } from "~/helpers/clientData";

const clientData: ClientData = {
  user: clientUser,
  posts: [clientPost],
  flashes: [clientFlash],
  rooms: [clientTalkRoom],
  messages: [clietnTalkRoomMessage],
  chatPartners: [],
};

describe("create clientData", () => {
  test("clientDataを返す", () => {
    const result = createClientData({
      user,
      posts: [post],
      flashes: [flash],
      senderTalkRooms: [],
      recipientTalkRooms: [],
      viewedFlashes: [],
      readTalkRoomMessages: [readTalkRoomMessage],
    });

    result.flashes[0].timestamp = "timestamp";
    result.rooms[0].timestamp = "timestamp";
    result.messages[0].timestamp = "timestamp";

    console.log(result);
    expect(result).toEqual(clientData);
  });
});
